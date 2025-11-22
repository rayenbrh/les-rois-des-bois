import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import fs from 'fs/promises';

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async (dir: string): Promise<void> => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(config.storagePath, 'images');
    await ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter for images
 */
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

/**
 * Multer configuration for single image upload
 */
export const uploadSingle = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
}).single('image');

/**
 * Multer configuration for multiple image uploads
 */
export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 10) => {
  return multer({
    storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: config.maxFileSize,
    },
  }).array(fieldName, maxCount);
};

/**
 * Multer configuration for mixed fields
 */
export const uploadFields = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'variants', maxCount: 20 },
]);

/**
 * Delete uploaded file helper
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
