import express from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';
import Photo from '../models/Photo.ts';
import cloudinary from '../config/cloudinary.ts';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category, page = '1', limit = '15' } = req.query;
  try {
    let query = {};
    if (category && category !== 'All') {
      query = { category };
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const photos = await Photo.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await Photo.countDocuments(query);
    const hasMore = skip + photos.length < total;

    res.json({ photos, hasMore, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  console.log('[POST /api/photos] Upload requested');
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('[POST /api/photos] Multer/Cloudinary Upload Error:', err);
      return res.status(500).json({ error: `Cloudinary Upload Error. Please check your Cloudinary API keys in the settings. Details: ${err.message || 'Unknown'}` });
    }

    if (!req.file) {
      console.log('[POST /api/photos] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
      const { caption, category } = req.body;
      console.log(`[POST /api/photos] File uploaded: ${req.file.filename}, length: ${req.file.size}`);
      const newPhoto = await Photo.create({
        url: req.file.path,
        public_id: req.file.filename,
        caption: caption || '',
        category: category || 'Uncategorized'
      });
      console.log(`[POST /api/photos] File saved to db successfully`);
      res.json(newPhoto);
    } catch (saveErr) {
      console.error(`[POST /api/photos] Error saving photo:`, saveErr);
      res.status(500).json({ error: 'Failed to save photo metadata to DB' });
    }
  });
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, category } = req.body;
    await Photo.findByIdAndUpdate(id, { caption, category });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DELETE] Received request to delete photo with id: ${id}`);
    const photo = await Photo.findById(id);
    
    if (photo && photo.public_id) {
      try {
        console.log(`[DELETE] Deleting from Cloudinary: ${photo.public_id}`);
        await cloudinary.uploader.destroy(photo.public_id);
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err);
      }
    } else {
      console.log(`[DELETE] Photo not found or no public_id for id: ${id}`);
    }
    
    await Photo.findByIdAndDelete(id);
    console.log(`[DELETE] Photo deleted successfully from DB`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[DELETE] Error deleting photo:`, err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
