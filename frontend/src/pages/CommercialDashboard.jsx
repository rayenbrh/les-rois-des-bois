import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import CommercialOrders from '../components/commercial/CommercialOrders';
import CommercialClients from '../components/commercial/CommercialClients';
import '../styles/AdminDashboard.css';

const CommercialDashboard = () => {
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>Commercial Panel</h3>
        </div>

        <nav className="sidebar-nav">
          <Link to="/commercial" className="sidebar-link">
            <FiUsers /> My Clients
          </Link>
          <Link to="/commercial/orders" className="sidebar-link">
            <FiShoppingBag /> Orders
          </Link>
          <Link to="/credits" className="sidebar-link">
            <FiCreditCard /> Credits
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route index element={<CommercialClients />} />
          <Route path="clients" element={<CommercialClients />} />
          <Route path="orders" element={<CommercialOrders />} />
          <Route path="*" element={<Navigate to="/commercial" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default CommercialDashboard;
