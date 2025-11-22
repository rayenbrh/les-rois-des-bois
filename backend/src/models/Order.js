import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
  priceAtOrder: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // REMOVED required: true - will be set by pre-validate hook
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
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
  status: {
    type: String,
    enum: ['new', 'in_progress', 'shipped', 'delivered', 'cancelled'],
    default: 'new'
  },
  deliveryDate: {
    type: Date
  },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  notes: {
    type: String
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  // Commercial who manages this order
  commercial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate order number BEFORE validation
orderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;