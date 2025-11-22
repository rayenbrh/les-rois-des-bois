import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from '@/stores';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import ProductsPage from '@/pages/public/ProductsPage';
import ProductDetailPage from '@/pages/public/ProductDetailPage';
import CustomProductBuilder from '@/pages/public/CustomProductBuilder';
import LoginPage from '@/pages/auth/LoginPage';

// Client Pages
import ClientDashboard from '@/pages/client/ClientDashboard';
import ClientOrders from '@/pages/client/ClientOrders';
import ClientInvoices from '@/pages/client/ClientInvoices';

// Commercial Pages
import CommercialDashboard from '@/pages/commercial/CommercialDashboard';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';

// POS
import POSPage from '@/pages/pos/POSPage';

// Protected Route
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { theme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Auth Routes - ONLY route that doesn't require authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Public Routes - Now ALL require authentication */}
      <Route
        element={
          <ProtectedRoute>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/custom/:id" element={<CustomProductBuilder />} />
      </Route>

      {/* Client Routes */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="orders" element={<ClientOrders />} />
        <Route path="invoices" element={<ClientInvoices />} />
      </Route>

      {/* Commercial Routes */}
      <Route
        path="/dashboard/commercial"
        element={
          <ProtectedRoute allowedRoles={['commercial']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CommercialDashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* POS Routes */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={['store', 'admin']}>
            <POSPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
