import express from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';
import Photo from '../models/Photo.ts';
import cloudinary from '../config/cloudinary.ts';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let query = {};
    if (category && category !== 'All') {
      query = { category };
    }
    const photos = await Photo.find(query).sort({ created_at: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const { caption, category } = req.body;
    const newPhoto = await Photo.create({
      url: req.file.path,
      public_id: req.file.filename,
      caption: caption || '',
      category: category || 'Uncategorized'
    });
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save photo' });
  }
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
    const photo = await Photo.findById(id);
    
    if (photo && photo.public_id) {
      try {
        await cloudinary.uploader.destroy(photo.public_id);
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err);
      }
    }
    
    await Photo.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
