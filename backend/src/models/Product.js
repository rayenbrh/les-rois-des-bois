import mongoose from 'mongoose';

const priceThresholdSchema = new mongoose.Schema({
  minQuantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const subProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 0
  },
  colors: [{
    name: String,
    code: String,
    stock: Number
  }],
  // Standard product pricing
  prixDetail: {
    type: Number,
    default: 0
  },
  prixGros: [{
    type: priceThresholdSchema
  }],
  // Special product configuration
  isSpecialProduct: {
    type: Boolean,
    default: false
  },
  subProducts: [subProductSchema],
  // Combined images for special products (key = combination of subproduct IDs)
  combinedImages: {
    type: Map,
    of: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // SEO and metadata
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
