import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: ''
  });

  useEffect(() => {
    if (user?.role === 'client') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await api.put('/auth/profile', updateData);
      updateUser(data);
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-container">
          <div className="profile-info-section">
            <h2>Profile Information</h2>

            {editMode ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-gold">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-gold"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-item">
                  <strong>Name:</strong> {user?.name}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="detail-item">
                  <strong>Role:</strong> {user?.role}
                </div>
                {user?.phone && (
                  <div className="detail-item">
                    <strong>Phone:</strong> {user.phone}
                  </div>
                )}

                <button className="btn btn-gold mt-3" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {user?.role === 'client' && (
            <div className="orders-section">
              <h2>My Orders</h2>

              {loading ? (
                <div className="flex-center" style={{ padding: '2rem 0' }}>
                  <div className="spinner"></div>
                </div>
              ) : orders.length === 0 ? (
                <p>No orders yet</p>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <Link
                      key={order._id}
                      to={`/order/${order._id}`}
                      className="order-item-card"
                    >
                      <div className="order-item-header">
                        <h4>Order #{order.orderNumber}</h4>
                        <span className="order-status-badge">{order.status}</span>
                      </div>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="order-item-footer">
                        <span className="order-total">€{order.total.toFixed(2)}</span>
                        <span className={`payment-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
