import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/db.ts';
import authRoutes from './src/routes/authRoutes.ts';
import photoRoutes from './src/routes/photoRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..');

const app = express();
const PORT = 3000;

// Trust proxy is required when running behind a reverse proxy (like Render or AI Studio)
// It ensures express-rate-limit accurately identifies users by their real IP
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow Vite and Cloudinary images
  crossOriginEmbedderPolicy: false
}));

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
  console.warn("⚠️ WARNING: Cloudinary credentials are not set in the environment. Photo uploads will fail.");
}

// Rate Limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  validate: { xForwardedForHeader: false, trustProxy: false } // Disable strict header validation
});
app.use('/api/', apiLimiter);

app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api', authRoutes);
app.use('/api/photos', photoRoutes);

// Serve static files from public directory (if needed)
app.use(express.static(path.join(rootPath, 'frontend', 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(rootPath, 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(rootPath, 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
