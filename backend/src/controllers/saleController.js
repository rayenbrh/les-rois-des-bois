import Sale from '../models/Sale.js';

// Create sale (POS user)
export const createSale = async (req, res) => {
  try {
    const { saleType, items, discount, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No sale items' });
    }

    if (!saleType || !['detail', 'gros'].includes(saleType)) {
      return res.status(400).json({ message: 'Invalid sale type' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.2; // 20% tax
    const discountAmount = discount || 0;
    const total = subtotal + tax - discountAmount;

    const sale = await Sale.create({
      posUser: req.user._id,
      saleType,
      items,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      notes
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sales (Admin sees all, POS sees own)
export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, saleType } = req.query;
    let query = {};

    // POS users can only see their own sales
    if (req.user.role === 'pos') {
      query.posUser = req.user._id;
    }

    if (saleType) {
      query.saleType = saleType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('posUser', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single sale
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('posUser', 'name email')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // POS users can only see their own sales
    if (req.user.role === 'pos' && sale.posUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete sale (Admin only)
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await sale.deleteOne();
    res.json({ message: 'Sale removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
