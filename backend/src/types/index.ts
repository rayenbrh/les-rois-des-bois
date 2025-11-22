import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Types
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  STORE = 'store',
  COMMERCIAL = 'commercial',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  role: UserRole;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  address?: string;
  locale: string;
  assignedCommercial?: Types.ObjectId;
  storeId?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: string[];
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Localized String
export interface LocalizedString {
  ar: string;
  en?: string;
  fr?: string;
}

// Category Types
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: LocalizedString;
  slug: string;
  parentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// SubProduct Types
export interface ISubProduct extends Document {
  _id: Types.ObjectId;
  title: LocalizedString;
  sku: string;
  images: string[];
  extraPrice: number;
  stock: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface ProductVariant {
  _id?: Types.ObjectId;
  colorName: LocalizedString;
  sku: string;
  image?: string;
  stock: number;
}

export interface BulkPrice {
  minQty: number;
  price: number;
}

export interface ProductComponent {
  name: string; // 'legs', 'top', 'shade', etc.
  subProductIds: Types.ObjectId[];
}

export interface CombinationImage {
  keys: Record<string, string>; // componentId -> subProductId
  imagePath: string;
}

export enum CompositeGenerationType {
  AUTO = 'auto',
  MANUAL = 'manual',
  BOTH = 'both',
}

export enum StockPolicy {
  BY_PRODUCT = 'byProduct',
  BY_VARIANT = 'byVariant',
  BY_COMPONENT = 'byComponent',
}

export interface SpecialConfig {
  components: ProductComponent[];
  combinationImages: CombinationImage[];
  compositeGeneration: CompositeGenerationType;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: LocalizedString;
  description: LocalizedString;
  sku: string;
  images: string[];
  variants: ProductVariant[];
  price: {
    retail: number;
  };
  bulkPrices: BulkPrice[];
  cost: number;
  categories: Types.ObjectId[];
  isSpecial: boolean;
  specialConfig?: SpecialConfig;
  stockPolicy: StockPolicy;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderSource {
  CATALOG = 'catalog',
  POS = 'pos',
}

export interface OrderLine {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  componentSelections?: Record<string, Types.ObjectId>; // componentName -> subProductId
  titleAtOrder: LocalizedString;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  clientId: Types.ObjectId;
  commercialId?: Types.ObjectId;
  source: OrderSource;
  lines: OrderLine[];
  subtotal: number;
  discounts: number;
  remise: number;
  tax: number;
  total: number;
  costTotal: number;
  netIncome: number;
  status: OrderStatus;
  invoiceId?: Types.ObjectId;
  shippingDate?: Date;
  assignedStore?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface InvoicePayment {
  date: Date;
  amount: number;
  note?: string;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  relatedOrderId: Types.ObjectId;
  clientId: Types.ObjectId;
  commercialId?: Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  isPaid: boolean;
  payments: InvoicePayment[];
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// POS Sale Types
export enum SaleMode {
  GROS = 'gros',
  DETAIL = 'detail',
}

export interface IPOSSale extends Document {
  _id: Types.ObjectId;
  receiptNumber: string;
  storeId: Types.ObjectId;
  cashierId: Types.ObjectId;
  saleMode: SaleMode;
  lines: OrderLine[];
  subtotal: number;
  remise: number;
  tax: number;
  total: number;
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: Types.ObjectId;
  meta?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
