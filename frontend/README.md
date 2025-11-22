# Les Rois des Bois - Frontend (ملوك الخشب)

**Luxury Furniture E-Commerce Platform - Frontend Application**

A modern, production-ready React TypeScript frontend with full Arabic RTL support, beautiful dark/light themes with gold accents, and comprehensive e-commerce features.

## 🌟 Features

### ✨ Core Features
- **Full Arabic RTL Support** - Complete right-to-left layout with Arabic fonts (Cairo, IBM Plex Arabic)
- **Dual Theme System** - Elegant dark/light themes with gold (#D4AF37) accents
- **Responsive Design** - Mobile-first, works beautifully on all devices
- **Authentication** - JWT-based with access/refresh tokens
- **Role-Based Access** - Admin, Client, Commercial, Store roles
- **Shopping Cart** - Full cart functionality with special product configurations
- **Product Configurator** - Interactive builder for custom furniture
- **POS System** - Tablet-friendly point-of-sale interface
- **Analytics Dashboard** - Charts and insights using Recharts
- **Invoice Management** - View and download PDF invoices
- **Real-time Search** - Instant product search with autocomplete

### 🎨 Design System
- **Dark Theme**: Charcoal background (#0E0E0E) with gold accents
- **Light Theme**: White background with elegant gold touches
- **Smooth Animations** - Framer Motion for micro-interactions
- **Custom Components** - Beautiful, reusable UI component library
- **Skeleton Loaders** - Professional loading states
- **Toast Notifications** - User-friendly feedback system

### 🏗️ Architecture
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** with RTL plugin
- **Zustand** for state management
- **React Query** for server state
- **React Router** for routing
- **Axios** with interceptors for API calls

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running on http://localhost:5000

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── auth.ts            # Authentication API
│   │   ├── products.ts        # Products API
│   │   ├── orders.ts          # Orders API
│   │   └── index.ts
│   ├── components/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── PublicFooter.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardHeader.tsx
│   │   ├── ui/                # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── ProtectedRoute.tsx
│   ├── layouts/               # Page layouts
│   │   ├── PublicLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/                 # Application pages
│   │   ├── public/            # Public pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   └── CustomProductBuilder.tsx
│   │   ├── auth/              # Auth pages
│   │   │   └── LoginPage.tsx
│   │   ├── client/            # Client dashboard
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── ClientOrders.tsx
│   │   │   └── ClientInvoices.tsx
│   │   ├── commercial/        # Commercial dashboard
│   │   │   └── CommercialDashboard.tsx
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminUsers.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   └── AdminOrders.tsx
│   │   └── pos/               # POS system
│   │       └── POSPage.tsx
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts       # Authentication state
│   │   ├── themeStore.ts      # Theme state
│   │   ├── cartStore.ts       # Shopping cart
│   │   ├── posStore.ts        # POS state
│   │   └── index.ts
│   ├── lib/                   # Libraries & utilities
│   │   ├── axios.ts           # Axios instance
│   │   └── utils.ts           # Utility functions
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── hooks/                 # Custom hooks
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: Access token stored in memory, refresh token in localStorage
3. **API Requests**: Access token attached to all requests via interceptor
4. **Token Refresh**: Automatic refresh when access token expires
5. **Logout**: Tokens cleared, redirect to login

```typescript
// Example login
import { authAPI } from '@/api';

const { data } = await authAPI.login(email, password);
// Tokens automatically stored by authStore
```

## 🎨 Theme System

The app supports dark and light themes with persistent storage:

```typescript
import { useThemeStore } from '@/stores';

function MyComponent() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Color Palette

**Dark Theme**:
- Background: `#0E0E0E` (Charcoal)
- Gold Accent: `#D4AF37`
- Text: `#FFFFFF`

**Light Theme**:
- Background: `#FFFFFF`
- Gold Accent: `#D4AF37`
- Text: `#0E0E0E`

## 🛒 Shopping Cart

```typescript
import { useCartStore } from '@/stores';

function ProductCard({ product }) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem(product, 1); // product, quantity
  };

  return (
    <button onClick={handleAddToCart}>
      أضف إلى السلة
    </button>
  );
}
```

## 📊 State Management

### Zustand Stores

**authStore**: User authentication state
```typescript
{
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  setAuth: (user, accessToken, refreshToken) => void,
  logout: () => void
}
```

**themeStore**: Theme preferences
```typescript
{
  theme: 'dark' | 'light',
  toggleTheme: () => void,
  setTheme: (theme) => void
}
```

**cartStore**: Shopping cart
```typescript
{
  items: CartItem[],
  addItem: (product, qty, variant?, components?) => void,
  removeItem: (index) => void,
  updateQuantity: (index, qty) => void,
  clearCart: () => void,
  getTotal: () => number
}
```

**posStore**: Point of sale
```typescript
{
  saleMode: 'gros' | 'detail',
  lines: OrderLine[],
  remise: number,
  addLine: (line) => void,
  clearSale: () => void,
  getTotal: (taxRate) => number
}
```

## 🔌 API Integration

### React Query Hooks

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsAPI } from '@/api';

// Fetch products
const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productsAPI.getAll(filters),
});

// Create product
const mutation = useMutation({
  mutationFn: productsAPI.create,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

## 🌍 Localization

The app is primarily in Arabic with RTL support. The structure supports multiple languages:

```typescript
// Localized strings
interface LocalizedString {
  ar: string;
  en?: string;
  fr?: string;
}

// Usage
import { getLocalizedString } from '@/lib/utils';

const title = getLocalizedString(product.title); // Returns Arabic by default
```

## 📱 Pages & Routes

### Public Routes
- `/` - Homepage with hero and featured products
- `/products` - Product listing with filters
- `/products/:id` - Product detail page
- `/custom/:id` - Special product configurator

### Auth Routes
- `/login` - Login page

### Client Routes (Role: client)
- `/dashboard/client` - Overview
- `/dashboard/client/orders` - Order history
- `/dashboard/client/invoices` - Invoices and credits

### Commercial Routes (Role: commercial)
- `/dashboard/commercial` - Sales dashboard
- `/dashboard/commercial/clients` - Assigned clients
- `/dashboard/commercial/analytics` - Sales analytics

### Admin Routes (Role: admin)
- `/dashboard/admin` - Admin overview
- `/dashboard/admin/users` - User management (CRUD)
- `/dashboard/admin/products` - Product management
- `/dashboard/admin/orders` - Order management
- `/dashboard/admin/categories` - Category management
- `/dashboard/admin/analytics` - Full analytics

### Store Routes (Role: store)
- `/pos` - Point of sale interface

## 🎯 Key Components

### Button Component
```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>
```

### Card Component
```tsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

<div className="card-hover">Hover effect</div>
```

### Input Component
```tsx
<input type="text" className="input" placeholder="أدخل النص" />
<input type="text" className="input input-error" />
```

### Badge Component
```tsx
<span className="badge bg-green-100 text-green-800">نشط</span>
```

## 🎨 Styling Guide

### Using Tailwind Classes

```tsx
// Dark mode support
<div className="bg-white dark:bg-charcoal">

// Gold accents
<div className="text-gold border-gold">

// Gradients
<div className="bg-gradient-gold">

// Custom animations
<div className="animate-fade-in">

// RTL-aware spacing
<div className="mr-4"> {/* Becomes margin-left in RTL */}
```

### Custom Utilities

```css
.text-gold-gradient  /* Gold gradient text */
.gold-border         /* Gold border with hover effect */
.skeleton            /* Shimmer loading effect */
.hero-gradient       /* Dark gradient background */
```

## 📊 Analytics & Charts

Using Recharts for data visualization:

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<BarChart data={salesData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Bar dataKey="total" fill="#D4AF37" />
</BarChart>
```

## 🖨️ PDF Features

Viewing and downloading invoices:

```typescript
// Download invoice PDF
const downloadInvoice = async (invoiceId: string) => {
  const response = await axios.get(`/api/pdf/invoice/${invoiceId}`, {
    responseType: 'blob',
  });

  downloadBlob(response.data, `invoice-${invoiceId}.pdf`);
};
```

## 🔒 Security

- **JWT Tokens**: Secure authentication with automatic refresh
- **Protected Routes**: Role-based access control
- **XSS Protection**: React's built-in XSS protection
- **CSRF**: SameSite cookies (when implemented)
- **Input Validation**: Client-side validation before API calls

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Lint code
npm run lint
```

## 📝 Environment Variables

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Les Rois des Bois
VITE_APP_NAME_AR=ملوك الخشب
```

## 🎯 Best Practices

1. **Component Organization**: Keep components small and focused
2. **State Management**: Use React Query for server state, Zustand for UI state
3. **Type Safety**: Leverage TypeScript for type safety
4. **Performance**: Use React.memo, useMemo, useCallback when needed
5. **Accessibility**: Include ARIA labels and keyboard navigation
6. **Code Style**: Follow the established patterns in existing components

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running on port 5000
- Check CORS configuration
- Verify API_BASE_URL in .env

### Theme Not Persisting
- Check localStorage permissions
- Clear browser cache
- Verify Zustand persist middleware

### RTL Issues
- Ensure Tailwind RTL plugin is installed
- Check html dir="rtl" attribute
- Use logical properties (mr/ml become ms/me)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)
- [Headless UI](https://headlessui.com)

## 🤝 Contributing

1. Follow the existing code style
2. Write TypeScript with proper types
3. Test in both dark and light themes
4. Ensure RTL compatibility
5. Update documentation for new features

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For support or questions:
- Email: support@lesroisdebois.com
- Documentation: Check this README
- Issues: Report via GitHub issues

---

**Made with ❤️ for Les Rois des Bois (ملوك الخشب)**

*Luxury furniture e-commerce platform with Arabic support*
