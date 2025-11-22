import mongoose, { Schema } from 'mongoose';
import { IPOSSale, SaleMode } from '../types';

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

const posSaleSchema = new Schema<IPOSSale>(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    saleMode: {
      type: String,
      enum: Object.values(SaleMode),
      required: true,
    },
    lines: {
      type: [orderLineSchema],
      required: true,
      validate: {
        validator: (lines: any[]) => lines.length > 0,
        message: 'Sale must have at least one line item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
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
    pdfPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
posSaleSchema.index({ storeId: 1, createdAt: -1 });
posSaleSchema.index({ cashierId: 1, createdAt: -1 });
posSaleSchema.index({ saleMode: 1, createdAt: -1 });

const POSSale = mongoose.model<IPOSSale>('POSSale', posSaleSchema);

export default POSSale;
