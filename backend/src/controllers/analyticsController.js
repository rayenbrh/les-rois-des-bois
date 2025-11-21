import Order from '../models/Order.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import dayjs from 'dayjs';

// Get analytics dashboard data
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total revenue from orders
    const orders = await Order.find(dateFilter);
    const totalOrderRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const paidOrderRevenue = orders.filter(o => o.isPaid).reduce((sum, order) => sum + order.total, 0);
    const unpaidOrderRevenue = orders.filter(o => !o.isPaid).reduce((sum, order) => sum + order.total, 0);

    // Total revenue from POS sales
    const sales = await Sale.find(dateFilter);
    const totalSalesRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    // Total revenue
    const totalRevenue = totalOrderRevenue + totalSalesRevenue;

    // Order statistics
    const orderStats = {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Sales statistics
    const salesStats = {
      total: sales.length,
      detail: sales.filter(s => s.saleType === 'detail').length,
      gros: sales.filter(s => s.saleType === 'gros').length,
      detailRevenue: sales.filter(s => s.saleType === 'detail').reduce((sum, s) => sum + s.total, 0),
      grosRevenue: sales.filter(s => s.saleType === 'gros').reduce((sum, s) => sum + s.total, 0)
    };

    // Most popular products (from orders and sales)
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            title: item.title,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.totalPrice;
      });
    });

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            title: item.title,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.totalPrice;
      });
    });

    const popularProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Revenue by month (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = dayjs().subtract(i, 'month').startOf('month').toDate();
      const monthEnd = dayjs().subtract(i, 'month').endOf('month').toDate();

      const monthOrders = orders.filter(o =>
        o.createdAt >= monthStart && o.createdAt <= monthEnd
      );
      const monthSales = sales.filter(s =>
        s.createdAt >= monthStart && s.createdAt <= monthEnd
      );

      const monthOrderRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
      const monthSalesRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);

      monthlyRevenue.push({
        month: dayjs(monthStart).format('MMM YYYY'),
        orderRevenue: monthOrderRevenue,
        salesRevenue: monthSalesRevenue,
        total: monthOrderRevenue + monthSalesRevenue
      });
    }

    res.json({
      totalRevenue,
      totalOrderRevenue,
      paidOrderRevenue,
      unpaidOrderRevenue,
      totalSalesRevenue,
      orderStats,
      salesStats,
      popularProducts,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get commercial-specific analytics
export const getCommercialAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = { commercial: req.user._id };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(dateFilter);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const paidRevenue = orders.filter(o => o.isPaid).reduce((sum, order) => sum + order.total, 0);
    const unpaidRevenue = orders.filter(o => !o.isPaid).reduce((sum, order) => sum + order.total, 0);

    const orderStats = {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    };

    res.json({
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      orderStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
