import { Types } from 'mongoose';
import { AuditLog } from '../models';
import logger from '../utils/logger';

interface AuditLogData {
  userId: Types.ObjectId | string;
  action: string;
  resourceType: string;
  resourceId?: Types.ObjectId | string;
  meta?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await AuditLog.create({
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        meta: data.meta,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      logger.info(
        `Audit log created: ${data.action} on ${data.resourceType} by ${data.userId}`
      );
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - auditing should not break the main flow
    }
  }

  /**
   * Log user authentication
   */
  async logAuth(
    userId: Types.ObjectId | string,
    action: 'login' | 'logout' | 'register' | 'refresh',
    meta?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `auth_${action}`,
      resourceType: 'auth',
      meta,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user creation/update/deletion
   */
  async logUserAction(
    performedBy: Types.ObjectId | string,
    action: 'create' | 'update' | 'delete',
    userId: Types.ObjectId | string,
    meta?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: performedBy,
      action: `user_${action}`,
      resourceType: 'user',
      resourceId: userId,
      meta,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log product actions
   */
  async logProductAction(
    userId: Types.ObjectId | string,
    action: 'create' | 'update' | 'delete',
    productId: Types.ObjectId | string,
    meta?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `product_${action}`,
      resourceType: 'product',
      resourceId: productId,
      meta,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log order actions
   */
  async logOrderAction(
    userId: Types.ObjectId | string,
    action: 'create' | 'update' | 'cancel' | 'complete',
    orderId: Types.ObjectId | string,
    meta?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `order_${action}`,
      resourceType: 'order',
      resourceId: orderId,
      meta,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log invoice actions
   */
  async logInvoiceAction(
    userId: Types.ObjectId | string,
    action: 'create' | 'update' | 'paid' | 'void',
    invoiceId: Types.ObjectId | string,
    meta?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `invoice_${action}`,
      resourceType: 'invoice',
      resourceId: invoiceId,
      meta,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log price changes (critical for audit trail)
   */
  async logPriceChange(
    userId: Types.ObjectId | string,
    productId: Types.ObjectId | string,
    oldPrice: number,
    newPrice: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'price_change',
      resourceType: 'product',
      resourceId: productId,
      meta: {
        oldPrice,
        newPrice,
        change: newPrice - oldPrice,
        changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: Types.ObjectId | string;
    resourceType?: string;
    resourceId?: Types.ObjectId | string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.resourceType) query.resourceType = filters.resourceType;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.action) query.action = filters.action;

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
      }

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .populate('userId', 'name email role')
        .lean();

      return logs;
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(
    userId: Types.ObjectId | string,
    days: number = 30
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await AuditLog.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId.toString()),
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return logs;
    } catch (error) {
      logger.error('Error getting user activity summary:', error);
      return [];
    }
  }
}

export default new AuditService();
