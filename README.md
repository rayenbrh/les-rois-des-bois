# Les Rois des Bois - Luxury Furniture Platform

A complete, production-ready MERN stack web application for a luxury furniture brand with advanced features including multi-tier pricing, POS system, order management, and analytics.

## Features

### User Roles

- **Admin**: Full access to manage users, products, orders, and view analytics
- **Client**: Browse catalog, place orders, view credits
- **Commercial**: Manage assigned clients and their orders
- **POS User**: Point-of-sale system with retail/wholesale pricing

### Core Functionality

- **Product Management**:
  - Standard products with colors, stock, and multi-tier pricing
  - Special configurable products (combine sub-products)
  - Category management
  - Image galleries with hover zoom

- **Order System**:
  - Client order submission
  - Order status tracking (New, In Progress, Shipped, Delivered)
  - PDF invoice generation
  - Credit/unpaid invoice tracking

- **POS System**:
  - Retail (détail) and wholesale (gros) pricing modes
  - Discount support
  - PDF receipt generation
  - Multi-payment methods

- **Analytics Dashboard**:
  - Revenue tracking (orders + POS sales)
  - Visual charts (monthly revenue, popular products)
  - Order statistics
  - Unpaid invoices tracking

- **Luxury UI/UX**:
  - Light/dark theme with metallic gold accents
  - Fully responsive (desktop, tablet, mobile)
  - Smooth animations and transitions
  - Clean, minimalist design

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- PDFKit for PDF generation
- Bcrypt for password hashing

### Frontend
- React 18
- Vite
- React Router v6
- Axios for API calls
- Recharts for analytics
- Context API for state management

## Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000` and proxy API requests to `http://localhost:5000`.

## Default Users

Create initial admin user using MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Admin",
  email: "admin@lesroisdubois.com",
  password: "$2a$10$hashed_password", // Use bcrypt to hash
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (client)
- `GET /api/orders` - Get orders (filtered by role)
- `GET /api/orders/unpaid` - Get unpaid orders
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/paid` - Mark order paid/unpaid

### Sales (POS)
- `POST /api/sales` - Create POS sale
- `GET /api/sales` - Get sales history
- `GET /api/sales/:id` - Get single sale

### Analytics
- `GET /api/analytics/dashboard` - Admin dashboard analytics
- `GET /api/analytics/commercial` - Commercial analytics

### PDF Generation
- `GET /api/pdf/invoice/:orderId` - Generate invoice PDF
- `GET /api/pdf/receipt/:saleId` - Generate receipt PDF

## Project Structure

```
les-rois-des-bois/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # PDF generation utilities
│   │   └── server.js       # Express app entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Page components
    │   ├── styles/         # CSS files
    │   ├── utils/          # API utilities
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    └── package.json
```

## Deployment

### Backend

1. Set environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret for JWT tokens
   - `NODE_ENV`: Set to `production`

2. Build and start:
```bash
npm start
```

### Frontend

1. Build for production:
```bash
npm run build
```

2. Serve the `dist` folder with a static server or hosting platform.

## Contributing

This is a proprietary application for Les Rois des Bois. Contact the development team for contribution guidelines.

## License

MIT License - See LICENSE file for details

## Support

For support and inquiries, contact: support@lesroisdubois.com
