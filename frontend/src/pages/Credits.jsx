import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FiDownload } from 'react-icons/fi';
import '../styles/Credits.css';

const Credits = () => {
  const { user } = useAuth();
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnpaidOrders();
  }, []);

  const fetchUnpaidOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/unpaid');
      setUnpaidOrders(data);
    } catch (error) {
      console.error('Error fetching unpaid orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (orderId) => {
    window.open(`/api/pdf/invoice/${orderId}`, '_blank');
  };

  const totalUnpaid = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="credits-page">
      <div className="container">
        <header className="credits-header">
          <h1>Credits & Unpaid Invoices</h1>
          {user.role === 'client' && (
            <p>View and manage your outstanding invoices</p>
          )}
        </header>

        <div className="credits-summary">
          <div className="summary-card">
            <h3>Total Unpaid</h3>
            <div className="summary-value">€{totalUnpaid.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h3>Number of Invoices</h3>
            <div className="summary-value">{unpaidOrders.length}</div>
          </div>
        </div>

        {unpaidOrders.length === 0 ? (
          <div className="no-credits">
            <p>No unpaid invoices</p>
          </div>
        ) : (
          <div className="credits-list">
            {unpaidOrders.map(order => (
              <div key={order._id} className="credit-card">
                <div className="credit-header">
                  <div>
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="credit-amount">
                    €{order.total.toFixed(2)}
                  </div>
                </div>

                {user.role !== 'client' && (
                  <div className="client-info">
                    <strong>Client:</strong> {order.client?.name} ({order.client?.email})
                  </div>
                )}

                <div className="order-items-summary">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.title} x {item.quantity} - €{item.totalPrice.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="credit-footer">
                  <span className="order-status">{order.status}</span>
                  <button
                    className="btn btn-outline-gold btn-sm"
                    onClick={() => downloadInvoice(order._id)}
                  >
                    <FiDownload /> Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Credits;
