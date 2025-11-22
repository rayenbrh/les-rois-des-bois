import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  color: {
    name: String,
    code: String
  },
  // For special products
  selectedSubProducts: [{
    subProductId: mongoose.Schema.Types.ObjectId,
    name: String,
    image: String
  }],
  priceAtSale: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { _id: true });

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true
    // REMOVED required: true - will be set by pre-validate hook
  },
  posUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  saleType: {
    type: String,
    enum: ['detail', 'gros'],
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'check', 'transfer'],
    default: 'cash'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate sale number BEFORE validation
saleSchema.pre('validate', async function(next) {
  if (this.isNew && !this.saleNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    this.saleNumber = `SALE-${Date.now()}-${count + 1}`;
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;