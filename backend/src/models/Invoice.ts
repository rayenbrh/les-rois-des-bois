import mongoose, { Schema } from 'mongoose';
import { IInvoice } from '../types';

const paymentSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
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
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    payments: [paymentSchema],
    pdfPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
invoiceSchema.index({ clientId: 1, isPaid: 1 });
invoiceSchema.index({ commercialId: 1, isPaid: 1 });
invoiceSchema.index({ dueDate: 1, isPaid: 1 });

// Update isPaid flag when payments are modified
invoiceSchema.pre('save', function (next) {
  if (this.amountPaid >= this.amountDue) {
    this.isPaid = true;
  } else {
    this.isPaid = false;
  }
  next();
});

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;
