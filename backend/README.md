# Les Rois des Bois - Backend API

Production-ready MERN backend for **Les Rois des Bois** (ملوك الخشب) - A comprehensive furniture e-commerce platform with full Arabic support, PDF generation, image processing, and role-based access control.

## 🌟 Features

- **Authentication & Authorization**: JWT-based auth with access and refresh tokens, role-based access control (Admin, Client, Store, Commercial)
- **Arabic Support**: Full RTL support with localized content (Arabic, English, French)
- **Product Management**: Standard and special customizable products with variants, bulk pricing
- **Order Management**: Complete order lifecycle with status tracking
- **Invoice System**: Professional invoice generation with payment tracking
- **POS Integration**: Point-of-sale system for in-store sales
- **PDF Generation**: Arabic-ready invoices and receipts with RTL layout (using PDFKit)
- **Image Processing**: Automatic thumbnail generation and image composition (using Sharp)
- **Analytics**: Sales reports, product analytics, and commercial performance tracking
- **Audit Logging**: Complete activity tracking for compliance
- **Email Notifications**: Automated emails for orders, invoices, and user actions
- **API Documentation**: OpenAPI/Swagger documentation
- **Testing**: Comprehensive unit and integration tests
- **Docker Support**: Full containerization with docker-compose

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Celebrate + Joi
- **PDF Generation**: PDFKit
- **Image Processing**: Sharp
- **Email**: Nodemailer
- **Logging**: Pino
- **Testing**: Jest + Supertest
- **Documentation**: Swagger UI Express
- **Security**: Helmet, CORS, express-rate-limit
- **Containerization**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 7.0 (or use Docker)
- (Optional) Redis for caching

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Important variables to set**:
- `JWT_SECRET`: Strong secret for JWT tokens
- `JWT_REFRESH_SECRET`: Strong secret for refresh tokens
- `MONGO_URI`: MongoDB connection string
- `SMTP_*`: Email service credentials (optional)

### 3. Run with Docker (Recommended)

```bash
# Start all services (MongoDB + Backend + Redis)
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 4. Run Locally (Development)

```bash
# Start MongoDB (if not using Docker)
# Make sure MongoDB is running on localhost:27017

# Install dependencies
npm install

# Run database seed
npm run seed

# Start development server
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:5000/api/docs
```

## 🗄️ Database Seeding

The seed script creates sample data including:
- Admin user
- Commercial user
- 2 Client users
- Store user
- Product categories
- Sub-products (components)
- Sample products (standard + special customizable products)

```bash
npm run seed
```

**Sample accounts created**:
- **Admin**: `admin@lesroisdebois.com` / `Admin123!`
- **Commercial**: `commercial@lesroisdebois.com` / `Commercial123!`
- **Client 1**: `client1@example.com` / `Client123!`
- **Client 2**: `client2@example.com` / `Client123!`
- **Store**: `store@lesroisdebois.com` / `Store123!`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Generate coverage report
npm test -- --coverage
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, env, swagger)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, validation, error handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (PDF, email, image, pricing, audit)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (logger, etc.)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── scripts/             # Utility scripts (seed, migration)
├── uploads/             # File uploads directory
├── pdfs/                # Generated PDFs directory
├── logs/                # Application logs
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🔐 Authentication Flow

1. **Register/Login**: Get access token + refresh token
2. **API Requests**: Include access token in `Authorization: Bearer <token>` header
3. **Token Refresh**: Use refresh token to get new access token when expired
4. **Logout**: Invalidate refresh token

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- Product/category CRUD
- Order management
- Invoice generation
- Analytics access

### Commercial
- View assigned clients
- Manage client orders
- Generate invoices for assigned clients
- View analytics for assigned clients

### Client
- Browse products (catalog)
- Create orders
- View own orders and invoices
- Update profile

### Store
- Create POS sales
- View store sales
- Generate receipts

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (Admin/Commercial)
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/assign-commercial` - Assign commercial to client (Admin)

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/generate-composite` - Generate composite image (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id/status` - Update order status (Admin/Commercial)
- `POST /api/orders/:id/generate-invoice` - Generate invoice (Admin/Commercial)

### Additional Endpoints
See `/api/docs` for complete API documentation including:
- Categories
- SubProducts
- Invoices
- POS Sales
- Analytics

## 🎨 PDF Features

### Invoices
- Professional Arabic layout with RTL support
- Company branding and information
- Itemized product list
- Tax calculations
- Payment terms
- Sequential numbering (ROI-INV-2025-0001)

### POS Receipts
- Compact thermal printer format
- Arabic text
- Transaction details
- Sequential numbering (ROI-REC-2025-0001)

## 🖼️ Image Processing Features

- Automatic thumbnail generation (400x400px)
- Web-optimized images
- Composite image generation for special products
- Support for JPEG, PNG, WebP
- Sharp-based processing for high performance

## 📊 Pricing Logic

### Retail vs Wholesale
- **Detail (Retail)**: Uses retail price
- **Gros (Wholesale)**: Uses bulk pricing tiers

### Bulk Pricing Tiers
Products can have multiple pricing tiers based on quantity:
```javascript
{
  bulkPrices: [
    { minQty: 10, price: 135 },
    { minQty: 50, price: 120 }
  ]
}
```

### Component Extra Pricing
Special products with customizable components add extra prices:
- Base product price + component extra prices

## 🔒 Security Features

- Helmet for security headers
- CORS with whitelist
- Rate limiting (general + auth-specific)
- Input validation and sanitization
- JWT token expiration
- Password hashing with bcrypt (12 rounds)
- SQL injection protection (NoSQL)
- XSS protection

## 📈 Monitoring & Logging

- Structured logging with Pino
- Request/response logging
- Error tracking
- Audit trail for critical operations
- Performance monitoring ready

## 🌐 Deployment

### Production Checklist

1. **Environment Variables**: Set all production values in `.env`
2. **Database**: Use managed MongoDB (Atlas, etc.)
3. **Secrets**: Generate strong JWT secrets
4. **Email**: Configure SMTP for production
5. **Storage**: Consider AWS S3 for file storage (adapter included)
6. **SSL**: Use HTTPS (reverse proxy like Nginx)
7. **Monitoring**: Set up error tracking (Sentry)
8. **Backups**: Configure MongoDB backups

### Docker Deployment

```bash
# Build and run
docker-compose -f docker-compose.yml up --build -d

# Scale backend instances
docker-compose up --scale backend=3 -d
```

### Traditional Deployment

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options including:
- Server settings (port, environment)
- Database (MongoDB URI)
- JWT secrets and expiration
- Email/SMTP configuration
- Company information
- Tax rates and currency
- File storage settings
- Rate limiting
- Logging levels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 📧 Support

For support, email support@lesroisdebois.com

## 🙏 Acknowledgments

- Built with Node.js and Express
- MongoDB for data storage
- Sharp for image processing
- PDFKit for PDF generation
- Pino for logging

---

**Made with ❤️ for Les Rois des Bois (ملوك الخشب)**
