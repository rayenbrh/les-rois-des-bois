import mongoose, { Schema, Document } from 'mongoose';
import config from '../config/env';

interface ICounter extends Document {
  _id: string;
  seq: number;
  year: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  year: { type: Number, required: true },
});

const Counter = mongoose.model<ICounter>('Counter', counterSchema);

class CounterService {
  /**
   * Get next sequence number for a given type
   * Format: PREFIX-YEAR-NUMBER (e.g., ROI-INV-2025-0001)
   */
  async getNextSequence(type: 'invoice' | 'order' | 'receipt'): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = this.getPrefix(type);
    const counterId = `${type}_${currentYear}`;

    // Find and increment counter, or create new one for the year
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      {
        $inc: { seq: 1 },
        $setOnInsert: { year: currentYear }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    const paddedNumber = counter.seq.toString().padStart(4, '0');
    return `${prefix}-${currentYear}-${paddedNumber}`;
  }

  /**
   * Get prefix for document type
   */
  private getPrefix(type: 'invoice' | 'order' | 'receipt'): string {
    switch (type) {
      case 'invoice':
        return config.prefixes.invoice;
      case 'order':
        return config.prefixes.order;
      case 'receipt':
        return config.prefixes.receipt;
      default:
        return 'ROI';
    }
  }

  /**
   * Reset counters for a new year (optional maintenance task)
   */
  async resetYearlyCounters(): Promise<void> {
    const currentYear = new Date().getFullYear();
    await Counter.deleteMany({ year: { $lt: currentYear - 2 } }); // Keep last 2 years
  }
}

export default new CounterService();
