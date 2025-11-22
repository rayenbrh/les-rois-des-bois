import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const localizedStringSchema = new Schema(
  {
    ar: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
  },
  { _id: false }
);

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: localizedStringSchema,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for hierarchical queries
categorySchema.index({ parentId: 1, slug: 1 });

// Generate slug from Arabic name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name?.ar) {
    // Simple slug generation (in production, use a proper slug library)
    this.slug = this.name.ar
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .trim();
  }
  next();
});

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
