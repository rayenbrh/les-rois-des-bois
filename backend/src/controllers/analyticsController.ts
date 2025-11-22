import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import logger from '../utils/logger';

/**
 * Get sales analytics
 * GET /api/analytics/sales
 */
export const getSalesAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, commercialId } = req.query;

    // Build match query
    const match: any = {
      status: { $ne: 'cancelled' }, // Exclude cancelled orders
    };

    // Add date filter if provided
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate as string);
      if (endDate) match.createdAt.$lte = new Date(endDate as string);
    }

    // Add commercial filter if provided
    if (commercialId) {
      match.commercialId = commercialId;
    }

    // Get all orders matching criteria
    const orders = await Order.find(match)
      .populate('items.product')
      .populate('clientId', 'name email')
      .populate('commercialId', 'name email');

    // Calculate totals
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalIncome = orders.reduce((sum, order) => sum + (order.income || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group sales by date
    const salesByDateMap = new Map<string, { total: number; count: number }>();
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const existing = salesByDateMap.get(date) || { total: 0, count: 0 };
      salesByDateMap.set(date, {
        total: existing.total + order.total,
        count: existing.count + 1,
      });
    });

    const salesByDate = Array.from(salesByDateMap.entries()).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
    }));

    // Calculate top products
    const productSales = new Map<
      string,
      { product: any; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product._id.toString();
        const existing = productSales.get(productId);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productSales.set(productId, {
            product: item.product,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => ({
        product: item.product,
        sales: item.quantity,
        revenue: item.revenue,
      }));

    // Calculate sales by category (simplified - using product categories)
    const categorySales = new Map<string, { category: any; sales: number; revenue: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product && item.product.category) {
          const categoryId = item.product.category._id?.toString() || 'uncategorized';
          const existing = categorySales.get(categoryId);

          if (existing) {
            existing.sales += item.quantity;
            existing.revenue += item.price * item.quantity;
          } else {
            categorySales.set(categoryId, {
              category: item.product.category,
              sales: item.quantity,
              revenue: item.price * item.quantity,
            });
          }
        }
      });
    });

    const salesByCategory = Array.from(categorySales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalIncome,
        averageOrderValue,
        salesByDate,
        topProducts,
        salesByCategory,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تحليلات المبيعات',
      error: error.message,
    });
  }
};

/**
 * Get dashboard statistics
 * GET /api/analytics/dashboard
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Build match query based on role
    const match: any = {};

    if (userRole === 'commercial') {
      match.commercialId = userId;
    } else if (userRole === 'client') {
      match.clientId = userId;
    }

    // Get recent orders
    const recentOrders = await Order.find(match)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('clientId', 'name email')
      .populate('commercialId', 'name email');

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      ...match,
      status: { $in: ['new', 'processing'] },
    });

    // Calculate total revenue (for current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          ...match,
          createdAt: { $gte: startOfMonth },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        recentOrders,
        pendingOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        monthlyOrderCount: monthlyRevenue[0]?.count || 0,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات لوحة التحكم',
      error: error.message,
    });
  }
};
