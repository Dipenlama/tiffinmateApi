import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import path from 'path';
import fs from 'fs';

const itemsUploadDir = path.join(__dirname, '..', '..', 'uploads', 'items');
if (!fs.existsSync(itemsUploadDir)) {
  fs.mkdirSync(itemsUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => cb(null, itemsUploadDir),
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};

export const itemUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
});
