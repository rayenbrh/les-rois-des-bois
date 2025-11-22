// User Types
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  STORE = 'store',
  COMMERCIAL = 'commercial',
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  locale: string;
  assignedCommercial?: User | string;
  storeId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// Localized String
export interface LocalizedString {
  ar: string;
  en?: string;
  fr?: string;
}

// Category
export interface Category {
  _id: string;
  name: LocalizedString;
  slug: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// SubProduct (Component)
export interface SubProduct {
  _id: string;
  title: LocalizedString;
  sku: string;
  images: string[];
  extraPrice: number;
  stock: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface ProductVariant {
  _id: string;
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
  name: string;
  subProductIds: SubProduct[] | string[];
}

export interface CombinationImage {
  keys: Record<string, string>;
  imagePath: string;
}

export enum CompositeGenerationType {
  AUTO = 'auto',
  MANUAL = 'manual',
  BOTH = 'both',
}

export interface SpecialConfig {
  components: ProductComponent[];
  combinationImages: CombinationImage[];
  compositeGeneration: CompositeGenerationType;
}

export interface Product {
  _id: string;
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
  categories: Category[] | string[];
  isSpecial: boolean;
  specialConfig?: SpecialConfig;
  stockPolicy: string;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

// Order
export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderLine {
  productId: Product | string;
  variantId?: string;
  componentSelections?: Record<string, string>;
  titleAtOrder: LocalizedString;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  clientId: User | string;
  commercialId?: User | string;
  source: 'catalog' | 'pos';
  lines: OrderLine[];
  subtotal: number;
  discounts: number;
  remise: number;
  tax: number;
  total: number;
  costTotal: number;
  netIncome: number;
  status: OrderStatus;
  invoiceId?: Invoice | string;
  shippingDate?: string;
  assignedStore?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice
export interface InvoicePayment {
  date: string;
  amount: number;
  note?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  relatedOrderId: Order | string;
  clientId: User | string;
  commercialId?: User | string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  isPaid: boolean;
  payments: InvoicePayment[];
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

// POS Sale
export interface POSSale {
  _id: string;
  receiptNumber: string;
  storeId: string;
  cashierId: User | string;
  saleMode: 'gros' | 'detail';
  lines: OrderLine[];
  subtotal: number;
  remise: number;
  tax: number;
  total: number;
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics
export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  totalIncome: number;
  averageOrderValue: number;
  salesByDate: Array<{ date: string; total: number; count: number }>;
  topProducts: Array<{ product: Product; sales: number; revenue: number }>;
  salesByCategory: Array<{ category: Category; sales: number; revenue: number }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Cart Item (for catalog shopping)
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  componentSelections?: Record<string, SubProduct>;
  qty: number;
  unitPrice: number;
  total: number;
}

// Theme
export type Theme = 'light' | 'dark';
