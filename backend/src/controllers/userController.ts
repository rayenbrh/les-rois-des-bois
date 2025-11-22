import { Response } from 'express';
import { User } from '../models';
import { auditService } from '../services';
import { AuthRequest, UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import config from '../config/env';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin only
 */
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.pagination.defaultPageSize;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by commercial (for commercial users, only show their clients)
    if (req.user?.role === UserRole.COMMERCIAL) {
      query.assignedCommercial = req.user.id;
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('assignedCommercial', 'name email')
        .populate('storeId', 'name')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
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
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin / Commercial (assigned) / Self
 */
export const getUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id)
      .populate('assignedCommercial', 'name email')
      .populate('storeId', 'name');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check access permissions
    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.id !== user._id.toString() &&
      user.assignedCommercial?.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Admin only
 */
export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const user = await User.create({
      ...req.body,
      passwordHash: req.body.password,
    });

    await auditService.logUserAction(
      req.user!.id,
      'create',
      user._id,
      { email: user.email, role: user.role },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: { user },
      message: 'User created successfully',
    });
  }
);

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin / Self (limited)
 */
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check permissions
    const isSelf = req.user?.id === user._id.toString();
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Restrict self-updates
    if (isSelf && !isAdmin) {
      const allowedFields = ['name', 'phone', 'address', 'locale'];
      Object.keys(req.body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }

    Object.assign(user, req.body);
    await user.save();

    await auditService.logUserAction(
      req.user!.id,
      'update',
      user._id,
      req.body,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: { user },
      message: 'User updated successfully',
    });
  }
);

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin only
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await user.deleteOne();

    await auditService.logUserAction(
      req.user!.id,
      'delete',
      user._id,
      { email: user.email },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);

/**
 * @desc    Assign commercial to client
 * @route   PUT /api/users/:id/assign-commercial
 * @access  Admin only
 */
export const assignCommercial = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { commercialId } = req.body;

    const [client, commercial] = await Promise.all([
      User.findById(req.params.id),
      User.findById(commercialId),
    ]);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    if (!commercial || commercial.role !== UserRole.COMMERCIAL) {
      res.status(400).json({
        success: false,
        message: 'Invalid commercial ID',
      });
      return;
    }

    client.assignedCommercial = commercial._id;
    await client.save();

    await auditService.logUserAction(
      req.user!.id,
      'update',
      client._id,
      { action: 'assign_commercial', commercialId },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: { user: client },
      message: 'Commercial assigned successfully',
    });
  }
);
