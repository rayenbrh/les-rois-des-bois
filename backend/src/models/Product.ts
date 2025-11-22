import mongoose, { Schema } from 'mongoose';
import { IProduct, StockPolicy, CompositeGenerationType } from '../types';

const localizedStringSchema = new Schema(
  {
    ar: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    colorName: {
      type: localizedStringSchema,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const bulkPriceSchema = new Schema(
  {
    minQty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const componentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subProductIds: [{
      type: Schema.Types.ObjectId,
      ref: 'SubProduct',
    }],
  },
  { _id: false }
);

const combinationImageSchema = new Schema(
  {
    keys: {
      type: Map,
      of: String,
    },
    imagePath: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const specialConfigSchema = new Schema(
  {
    components: [componentSchema],
    combinationImages: [combinationImageSchema],
    compositeGeneration: {
      type: String,
      enum: Object.values(CompositeGenerationType),
      default: CompositeGenerationType.MANUAL,
    },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
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
    variants: [variantSchema],
    price: {
      retail: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    bulkPrices: [bulkPriceSchema],
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    }],
    isSpecial: {
      type: Boolean,
      default: false,
      index: true,
    },
    specialConfig: {
      type: specialConfigSchema,
    },
    stockPolicy: {
      type: String,
      enum: Object.values(StockPolicy),
      default: StockPolicy.BY_PRODUCT,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
productSchema.index({ 'title.ar': 'text', 'description.ar': 'text', sku: 'text' });
productSchema.index({ categories: 1, isSpecial: 1 });
productSchema.index({ 'price.retail': 1 });
productSchema.index({ createdAt: -1 });

// Sort bulk prices by minQty before saving
productSchema.pre('save', function (next) {
  if (this.bulkPrices && this.bulkPrices.length > 0) {
    this.bulkPrices.sort((a, b) => a.minQty - b.minQty);
  }
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
