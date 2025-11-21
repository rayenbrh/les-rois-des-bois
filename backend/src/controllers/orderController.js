import Order from '../models/Order.js';
import User from '../models/User.js';

// Create order (Client)
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.2; // 20% tax (adjust as needed)
    const total = subtotal + tax;

    // Get client's assigned commercial
    const client = await User.findById(req.user._id);

    const order = await Order.create({
      client: req.user._id,
      items,
      subtotal,
      tax,
      total,
      shippingAddress: shippingAddress || client.address,
      notes,
      commercial: client.assignedCommercial
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (Admin) or assigned orders (Commercial) or own orders (Client)
export const getOrders = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'commercial') {
      query.commercial = req.user._id;
    }
    // Admin can see all orders (no query filter)

    const orders = await Order.find(query)
      .populate('client', 'name email phone')
      .populate('commercial', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('commercial', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access rights
    if (
      req.user.role === 'client' && order.client._id.toString() !== req.user._id.toString() ||
      req.user.role === 'commercial' && order.commercial && order.commercial._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin/Commercial)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access rights for commercial
    if (req.user.role === 'commercial' && order.commercial && order.commercial.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status) {
      order.status = status;
    }

    if (deliveryDate) {
      order.deliveryDate = deliveryDate;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark order as paid (Admin/Commercial)
export const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access rights for commercial
    if (req.user.role === 'commercial' && order.commercial && order.commercial.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : true;
    order.paidAt = order.isPaid ? new Date() : null;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unpaid orders (Credits) - Admin sees all, Client sees own, Commercial sees assigned
export const getUnpaidOrders = async (req, res) => {
  try {
    let query = { isPaid: false };

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'commercial') {
      query.commercial = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('client', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order (Admin only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
