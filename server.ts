import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Setup SQLite Database
const db = new Database('photos.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS photos_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    caption TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

app.get('/api/photos', (req, res) => {
  const { category } = req.query;
  let photos;
  if (category && category !== 'All') {
    photos = db.prepare('SELECT * FROM photos_v2 WHERE category = ? ORDER BY created_at DESC').all(category);
  } else {
    photos = db.prepare('SELECT * FROM photos_v2 ORDER BY created_at DESC').all();
  }
  res.json(photos);
});

app.post('/api/photos', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { caption, category } = req.body;
  const url = req.file.path;
  const public_id = req.file.filename;
  
  const stmt = db.prepare('INSERT INTO photos_v2 (url, public_id, caption, category) VALUES (?, ?, ?, ?)');
  const info = stmt.run(url, public_id, caption || '', category || 'Uncategorized');
  
  res.json({ id: info.lastInsertRowid, url, public_id, caption, category });
});

app.put('/api/photos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { caption, category } = req.body;
  
  const stmt = db.prepare('UPDATE photos_v2 SET caption = ?, category = ? WHERE id = ?');
  stmt.run(caption, category, id);
  
  res.json({ success: true });
});

app.delete('/api/photos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Get public_id to delete from Cloudinary
  const photo = db.prepare('SELECT public_id FROM photos_v2 WHERE id = ?').get(id) as any;
  if (photo && photo.public_id) {
    try {
      await cloudinary.uploader.destroy(photo.public_id);
    } catch (err) {
      console.error('Failed to delete from Cloudinary:', err);
    }
  }
  
  const stmt = db.prepare('DELETE FROM photos_v2 WHERE id = ?');
  stmt.run(id);
  
  res.json({ success: true });
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
