import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.ts';

const folderName = process.env.NODE_ENV === 'production' ? 'portfolio_prod' : 'portfolio_dev';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folderName,
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  } as any
});

export const upload = multer({ storage });
