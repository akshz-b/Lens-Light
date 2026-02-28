import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define Photo Schema
const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  caption: { type: String, default: '' },
  category: { type: String, default: 'Uncategorized' },
  created_at: { type: Date, default: Date.now }
});

// Transform _id to id for frontend compatibility
photoSchema.set('toJSON', {
  transform: (document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Photo = mongoose.model('Photo', photoSchema);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  } as any
});
const upload = multer({ storage });

// Auth Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secretpassword';

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/photos', async (req, res) => {
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

app.post('/api/photos', authenticateToken, upload.single('photo'), async (req, res) => {
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

app.put('/api/photos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, category } = req.body;
    await Photo.findByIdAndUpdate(id, { caption, category });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

app.delete('/api/photos/:id', authenticateToken, async (req, res) => {
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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
