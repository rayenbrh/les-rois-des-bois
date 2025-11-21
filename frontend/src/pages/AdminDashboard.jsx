import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingBag, FiTrendingUp, FiGrid } from 'react-icons/fi';
import Analytics from '../components/admin/Analytics';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import UserManagement from '../components/admin/UserManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>Admin Panel</h3>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link">
            <FiTrendingUp /> Analytics
          </Link>
          <Link to="/admin/products" className="sidebar-link">
            <FiPackage /> Products
          </Link>
          <Link to="/admin/categories" className="sidebar-link">
            <FiGrid /> Categories
          </Link>
          <Link to="/admin/orders" className="sidebar-link">
            <FiShoppingBag /> Orders
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <FiUsers /> Users
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route index element={<Analytics />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
