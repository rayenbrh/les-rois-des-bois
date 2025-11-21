import express from 'express';
import Order from '../models/Order.js';
import Sale from '../models/Sale.js';
import { generateInvoicePDF, generateReceiptPDF } from '../utils/pdfGenerator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Generate invoice PDF for an order
router.get('/invoice/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate receipt PDF for a POS sale
router.get('/receipt/:saleId', protect, authorize('pos', 'admin'), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.saleId)
      .populate('posUser', 'name email')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // POS users can only generate receipts for their own sales
    if (req.user.role === 'pos' && sale.posUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale.saleNumber}.pdf`);

    generateReceiptPDF(sale, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
