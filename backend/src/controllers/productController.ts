import { Response } from 'express';
import { Product } from '../models';
import { auditService, imageService } from '../services';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import config from '../config/env';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.pagination.defaultPageSize;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filters
    if (req.query.category) query.categories = req.query.category;
    if (req.query.isSpecial !== undefined) query.isSpecial = req.query.isSpecial === 'true';
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query['price.retail'] = {};
      if (req.query.minPrice) query['price.retail'].$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) query['price.retail'].$lte = parseFloat(req.query.maxPrice as string);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categories', 'name slug')
        .populate('createdBy', 'name')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id)
      .populate('categories', 'name slug')
      .populate('createdBy', 'name')
      .populate('specialConfig.components.subProductIds');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { product },
    });
  }
);

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Admin
 */
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const productData = {
      ...req.body,
      createdBy: req.user!.id,
    };

    const product = await Product.create(productData);

    await auditService.logProductAction(
      req.user!.id,
      'create',
      product._id,
      { sku: product.sku, title: product.title.ar },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created successfully',
    });
  }
);

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Track price changes
    if (req.body.price?.retail && req.body.price.retail !== product.price.retail) {
      await auditService.logPriceChange(
        req.user!.id,
        product._id,
        product.price.retail,
        req.body.price.retail,
        req.ip,
        req.get('user-agent')
      );
    }

    Object.assign(product, req.body);
    await product.save();

    await auditService.logProductAction(
      req.user!.id,
      'update',
      product._id,
      req.body,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: { product },
      message: 'Product updated successfully',
    });
  }
);

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    await product.deleteOne();

    await auditService.logProductAction(
      req.user!.id,
      'delete',
      product._id,
      { sku: product.sku },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  }
);

/**
 * @desc    Generate composite image for special product
 * @route   POST /api/products/:id/generate-composite
 * @access  Admin
 */
export const generateComposite = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { componentSelections, canvasConfig } = req.body;

    // Implementation would use imageService.createCompositeImage
    // For now, return success message

    res.json({
      success: true,
      message: 'Composite image generation feature - implement with Sharp layers',
    });
  }
);
