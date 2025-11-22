import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/les-rois-des-bois',
  mongoTestUri: process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/les-rois-des-bois-test',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Storage
  storageType: (process.env.STORAGE_TYPE || 'local') as 'local' | 's3',
  storagePath: process.env.STORAGE_PATH || './uploads',
  pdfPath: process.env.PDF_PATH || './pdfs',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'les-rois-des-bois',
  },

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
  emailFrom: process.env.EMAIL_FROM || 'Les Rois des Bois <noreply@lesroisdebois.com>',

  // Company
  company: {
    name: process.env.COMPANY_NAME || 'Les Rois des Bois',
    nameAr: process.env.COMPANY_NAME_AR || 'ملوك الخشب',
    address: process.env.COMPANY_ADDRESS || '123 Rue de la Forêt, Tunis, Tunisia',
    addressAr: process.env.COMPANY_ADDRESS_AR || '123 شارع الغابة، تونس، تونس',
    phone: process.env.COMPANY_PHONE || '+216 71 123 456',
    email: process.env.COMPANY_EMAIL || 'contact@lesroisdebois.com',
    taxId: process.env.COMPANY_TAX_ID || 'TN123456789',
    website: process.env.COMPANY_WEBSITE || 'www.lesroisdebois.com',
  },

  // Tax
  taxRate: parseFloat(process.env.TAX_RATE || '0.19'),
  currency: process.env.CURRENCY || 'TND',
  currencySymbol: process.env.CURRENCY_SYMBOL || 'د.ت',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },

  // Image Processing
  image: {
    thumbnailWidth: parseInt(process.env.THUMBNAIL_WIDTH || '400', 10),
    thumbnailHeight: parseInt(process.env.THUMBNAIL_HEIGHT || '400', 10),
    quality: parseInt(process.env.IMAGE_QUALITY || '80', 10),
  },

  // Numbering Prefixes
  prefixes: {
    invoice: process.env.INVOICE_PREFIX || 'ROI-INV',
    order: process.env.ORDER_PREFIX || 'ROI-ORD',
    receipt: process.env.RECEIPT_PREFIX || 'ROI-REC',
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET || 'development-session-secret',

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',

  // Sentry
  sentryDsn: process.env.SENTRY_DSN || '',
};

export default config;
