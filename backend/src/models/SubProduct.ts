import mongoose, { Schema } from 'mongoose';
import { ISubProduct } from '../types';

const localizedStringSchema = new Schema(
  {
    ar: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
  },
  { _id: false }
);

const subProductSchema = new Schema<ISubProduct>(
  {
    title: {
      type: localizedStringSchema,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    images: [{
      type: String,
    }],
    extraPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
subProductSchema.index({ 'title.ar': 'text', sku: 'text' });

const SubProduct = mongoose.model<ISubProduct>('SubProduct', subProductSchema);

export default SubProduct;
