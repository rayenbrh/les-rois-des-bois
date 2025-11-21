import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <button className="theme-toggle-login" onClick={toggleTheme}>
        {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
      </button>

      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">LES ROIS DES BOIS</h1>
          <p className="login-subtitle">Luxury Furniture</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-form-title">Sign In</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Contact your administrator for access</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
