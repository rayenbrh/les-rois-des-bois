import { Response } from 'express';
import { Order, Product, User, Invoice } from '../models';
import { counterService, pricingService, auditService, pdfService, emailService } from '../services';
import { AuthRequest, UserRole, OrderStatus, LocalizedString } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import config from '../config/env';

/**
 * @desc    Create order
 * @route   POST /api/orders
 * @access  Client / Admin
 */
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { lines, remise = 0 } = req.body;

    // Get client info
    const clientId = req.user?.role === UserRole.CLIENT ? req.user.id : req.body.clientId;
    const client = await User.findById(clientId);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Process order lines
    const processedLines = await Promise.all(
      lines.map(async (line: any) => {
        const product = await Product.findById(line.productId);
        if (!product) throw new Error(`Product ${line.productId} not found`);

        const unitPrice = pricingService.calculatePrice(product, line.qty);
        const lineTotal = unitPrice * line.qty;

        return {
          productId: product._id,
          variantId: line.variantId,
          componentSelections: line.componentSelections,
          titleAtOrder: product.title,
          unitPrice,
          qty: line.qty,
          lineTotal,
        };
      })
    );

    // Calculate totals
    const subtotal = processedLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const totals = pricingService.calculateOrderTotals(subtotal, remise, config.taxRate);

    // Calculate cost and margin
    const costTotal = 0; // Would calculate from product costs
    const netIncome = totals.total - costTotal;

    // Generate order number
    const orderNumber = await counterService.getNextSequence('order');

    // Create order
    const order = await Order.create({
      orderNumber,
      clientId,
      commercialId: client.assignedCommercial,
      source: 'catalog',
      lines: processedLines,
      subtotal,
      discounts: 0,
      remise,
      tax: totals.tax,
      total: totals.total,
      costTotal,
      netIncome,
      status: OrderStatus.NEW,
    });

    await auditService.logOrderAction(
      req.user!.id,
      'create',
      order._id,
      { orderNumber, total: order.total },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order created successfully',
    });
  }
);

/**
 * @desc    Get orders
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.pagination.defaultPageSize;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by role
    if (req.user?.role === UserRole.CLIENT) {
      query.clientId = req.user.id;
    } else if (req.user?.role === UserRole.COMMERCIAL) {
      query.commercialId = req.user.id;
    }

    if (req.query.status) query.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('clientId', 'name email')
        .populate('commercialId', 'name')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        orders,
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
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id)
      .populate('clientId', 'name email phone address')
      .populate('commercialId', 'name email')
      .populate('invoiceId');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { order },
    });
  }
);

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Admin / Commercial
 */
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    order.status = status;
    await order.save();

    await auditService.logOrderAction(
      req.user!.id,
      'update',
      order._id,
      { status },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: { order },
      message: 'Order status updated successfully',
    });
  }
);

/**
 * @desc    Generate invoice for order
 * @route   POST /api/orders/:id/generate-invoice
 * @access  Admin / Commercial
 */
export const generateInvoice = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id)
      .populate('clientId')
      .populate('commercialId');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    if (order.invoiceId) {
      res.status(400).json({
        success: false,
        message: 'Invoice already generated for this order',
      });
      return;
    }

    // Generate invoice number
    const invoiceNumber = await counterService.getNextSequence('invoice');

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      relatedOrderId: order._id,
      clientId: order.clientId,
      commercialId: order.commercialId,
      amountDue: order.total,
      amountPaid: 0,
      dueDate,
      isPaid: false,
      payments: [],
    });

    // Generate PDF
    const pdfPath = await pdfService.generateInvoice({
      invoice,
      order,
      client: order.clientId as any,
      commercial: order.commercialId as any,
    });

    invoice.pdfPath = pdfPath;
    await invoice.save();

    // Update order
    order.invoiceId = invoice._id;
    await order.save();

    await auditService.logInvoiceAction(
      req.user!.id,
      'create',
      invoice._id,
      { invoiceNumber, orderId: order._id },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: { invoice },
      message: 'Invoice generated successfully',
    });
  }
);
