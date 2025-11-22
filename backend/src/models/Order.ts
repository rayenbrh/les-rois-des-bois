import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus, OrderSource } from '../types';

const localizedStringSchema = new Schema(
  {
    ar: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
  },
  { _id: false }
);

const orderLineSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
    },
    componentSelections: {
      type: Map,
      of: Schema.Types.ObjectId,
    },
    titleAtOrder: {
      type: localizedStringSchema,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    commercialId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(OrderSource),
      required: true,
      default: OrderSource.CATALOG,
    },
    lines: {
      type: [orderLineSchema],
      required: true,
      validate: {
        validator: (lines: any[]) => lines.length > 0,
        message: 'Order must have at least one line item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discounts: {
      type: Number,
      default: 0,
      min: 0,
    },
    remise: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    costTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    netIncome: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEW,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    shippingDate: {
      type: Date,
    },
    assignedStore: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
orderSchema.index({ clientId: 1, createdAt: -1 });
orderSchema.index({ commercialId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ source: 1, createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
