import { Response } from 'express';
import { User } from '../models';
import { authService, auditService } from '../services';
import { AuthRequest, UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Admin only (or invite flow)
 */
export const register = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password, name, role, phone, address, locale, assignedCommercial, storeId } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      name,
      role,
      phone,
      address,
      locale: locale || 'ar',
      assignedCommercial,
      storeId,
      isActive: true,
    });

    // Generate tokens
    const tokens = authService.generateTokenPair(user._id, user.email, user.role);

    // Save refresh token
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // Audit log
    await auditService.logAuth(
      user._id,
      'register',
      { email: user.email, role: user.role },
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      },
      message: 'User registered successfully',
    });
  }
);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const tokens = authService.generateTokenPair(user._id, user.email, user.role);

    // Save refresh token (keep last 5)
    user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken].slice(-5);
    user.lastLogin = new Date();
    await user.save();

    // Audit log
    await auditService.logAuth(
      user._id,
      'login',
      { email: user.email },
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          locale: user.locale,
        },
        ...tokens,
      },
      message: 'Login successful',
    });
  }
);

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refresh = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = authService.verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Find user and verify refresh token exists
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
      return;
    }

    // Generate new tokens
    const tokens = authService.generateTokenPair(user._id, user.email, user.role);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Audit log
    await auditService.logAuth(
      user._id,
      'refresh',
      undefined,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully',
    });
  }
);

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Remove refresh token
    if (refreshToken) {
      const user = await User.findById(req.user.id).select('+refreshTokens');
      if (user && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
      }
    }

    // Audit log
    await auditService.logAuth(
      req.user.id,
      'logout',
      undefined,
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
);

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findById(req.user.id)
      .populate('assignedCommercial', 'name email')
      .populate('storeId', 'name');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  }
);
