import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary Config Check: Name=', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING', 'Key=', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING', 'Secret=', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');

export default cloudinary;
