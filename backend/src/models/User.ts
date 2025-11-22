import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserRole } from '../types';
import config from '../config/env';

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    locale: {
      type: String,
      default: 'ar',
    },
    assignedCommercial: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
    permissions: [{
      type: String,
    }],
    refreshTokens: [{
      type: String,
      select: false,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for commercial assigned clients lookup
userSchema.index({ role: 1, assignedCommercial: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  return obj;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
