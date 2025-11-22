import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import logger from '../utils/logger';

interface ProcessedImage {
  original: string;
  thumbnail?: string;
  webOptimized?: string;
}

interface CompositeLayerConfig {
  input: string;
  top: number;
  left: number;
  blend?: 'over' | 'in' | 'out' | 'atop' | 'dest' | 'dest-over' | 'dest-in' | 'dest-out' | 'dest-atop' | 'xor' | 'add' | 'saturate' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
}

class ImageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.storagePath;
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDir(subDir?: string): Promise<string> {
    const dir = subDir ? path.join(this.uploadDir, subDir) : this.uploadDir;
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  /**
   * Process uploaded image: create thumbnail and web-optimized version
   */
  async processImage(
    filePath: string,
    options?: {
      createThumbnail?: boolean;
      createWebOptimized?: boolean;
      thumbnailSize?: { width: number; height: number };
    }
  ): Promise<ProcessedImage> {
    const {
      createThumbnail = true,
      createWebOptimized = true,
      thumbnailSize = {
        width: config.image.thumbnailWidth,
        height: config.image.thumbnailHeight,
      },
    } = options || {};

    const result: ProcessedImage = {
      original: filePath,
    };

    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const dir = path.dirname(filePath);

      // Create thumbnail
      if (createThumbnail) {
        const thumbnailPath = path.join(dir, `${fileName}_thumb.jpg`);
        await sharp(filePath)
          .resize(thumbnailSize.width, thumbnailSize.height, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: config.image.quality })
          .toFile(thumbnailPath);
        result.thumbnail = thumbnailPath;
        logger.info(`Thumbnail created: ${thumbnailPath}`);
      }

      // Create web-optimized version
      if (createWebOptimized) {
        const webPath = path.join(dir, `${fileName}_web.jpg`);
        await sharp(filePath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: config.image.quality })
          .toFile(webPath);
        result.webOptimized = webPath;
        logger.info(`Web-optimized image created: ${webPath}`);
      }

      return result;
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Create composite image from multiple sub-product images
   * For special products with customizable components
   */
  async createCompositeImage(
    layers: CompositeLayerConfig[],
    outputPath?: string,
    canvas?: { width: number; height: number; background?: string }
  ): Promise<string> {
    try {
      const canvasConfig = canvas || {
        width: 800,
        height: 800,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      };

      // Generate output path if not provided
      const finalOutputPath =
        outputPath ||
        path.join(
          await this.ensureUploadDir('composites'),
          `composite_${uuidv4()}.jpg`
        );

      // Create base canvas
      const compositeImage = sharp({
        create: {
          width: canvasConfig.width,
          height: canvasConfig.height,
          channels: 4,
          background: canvasConfig.background || { r: 255, g: 255, b: 255, alpha: 1 },
        },
      });

      // Composite layers
      await compositeImage
        .composite(
          layers.map((layer) => ({
            input: layer.input,
            top: layer.top,
            left: layer.left,
            blend: layer.blend || 'over',
          }))
        )
        .jpeg({ quality: config.image.quality })
        .toFile(finalOutputPath);

      logger.info(`Composite image created: ${finalOutputPath}`);
      return finalOutputPath;
    } catch (error) {
      logger.error('Error creating composite image:', error);
      throw new Error('Failed to create composite image');
    }
  }

  /**
   * Resize image to specific dimensions
   */
  async resizeImage(
    inputPath: string,
    width: number,
    height: number,
    outputPath?: string
  ): Promise<string> {
    try {
      const finalOutputPath =
        outputPath ||
        path.join(
          path.dirname(inputPath),
          `${path.basename(inputPath, path.extname(inputPath))}_${width}x${height}.jpg`
        );

      await sharp(inputPath)
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: config.image.quality })
        .toFile(finalOutputPath);

      return finalOutputPath;
    } catch (error) {
      logger.error('Error resizing image:', error);
      throw new Error('Failed to resize image');
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(filePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(filePath).metadata();
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      throw new Error('Failed to get image metadata');
    }
  }

  /**
   * Delete image and its variants
   */
  async deleteImage(filePath: string, deleteVariants: boolean = true): Promise<void> {
    try {
      // Delete original
      await fs.unlink(filePath);

      if (deleteVariants) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const dir = path.dirname(filePath);

        // Delete thumbnail
        const thumbnailPath = path.join(dir, `${fileName}_thumb.jpg`);
        try {
          await fs.unlink(thumbnailPath);
        } catch (error) {
          // Ignore if doesn't exist
        }

        // Delete web-optimized
        const webPath = path.join(dir, `${fileName}_web.jpg`);
        try {
          await fs.unlink(webPath);
        } catch (error) {
          // Ignore if doesn't exist
        }
      }

      logger.info(`Image deleted: ${filePath}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Validate image file
   */
  async validateImage(filePath: string): Promise<{
    valid: boolean;
    error?: string;
    metadata?: sharp.Metadata;
  }> {
    try {
      const metadata = await sharp(filePath).metadata();

      // Check format
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (metadata.format && !allowedFormats.includes(metadata.format)) {
        return {
          valid: false,
          error: `Invalid image format. Allowed: ${allowedFormats.join(', ')}`,
        };
      }

      // Check dimensions
      if (metadata.width && metadata.height) {
        if (metadata.width < 100 || metadata.height < 100) {
          return {
            valid: false,
            error: 'Image is too small (minimum 100x100 pixels)',
          };
        }

        if (metadata.width > 5000 || metadata.height > 5000) {
          return {
            valid: false,
            error: 'Image is too large (maximum 5000x5000 pixels)',
          };
        }
      }

      return { valid: true, metadata };
    } catch (error) {
      return { valid: false, error: 'Invalid or corrupted image file' };
    }
  }
}

export default new ImageService();
