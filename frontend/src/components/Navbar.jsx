import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiUser, FiShoppingCart } from 'react-icons/fi';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/products', label: 'Products' },
          { to: '/admin/orders', label: 'Orders' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/analytics', label: 'Analytics' }
        ];
      case 'client':
        return [
          { to: '/catalog', label: 'Catalog' },
          { to: '/credits', label: 'Credits' },
          { to: '/profile', label: 'My Orders' }
        ];
      case 'pos':
        return [
          { to: '/pos', label: 'POS System' },
          { to: '/profile', label: 'Sales History' }
        ];
      case 'commercial':
        return [
          { to: '/commercial', label: 'Dashboard' },
          { to: '/commercial/clients', label: 'My Clients' },
          { to: '/commercial/orders', label: 'Orders' },
          { to: '/credits', label: 'Credits' }
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>LES ROIS DES BOIS</h2>
          <span className="navbar-tagline">Luxury Furniture</span>
        </Link>

        <div className="navbar-links">
          {getNavLinks().map((link) => (
            <Link key={link.to} to={link.to} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          <Link to="/profile" className="icon-btn" aria-label="Profile">
            <FiUser size={20} />
          </Link>

          <button className="icon-btn" onClick={logout} aria-label="Logout">
            <FiLogOut size={20} />
          </button>

          <div className="navbar-user">
            <span className="navbar-username">{user?.name}</span>
            <span className="navbar-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
