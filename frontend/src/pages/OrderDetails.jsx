import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import '../styles/OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    window.open(`/api/pdf/invoice/${order._id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <button className="btn btn-gold mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="order-details-container">
          <div className="order-header">
            <div>
              <h1>Order #{order.orderNumber}</h1>
              <p className="order-date">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button className="btn btn-gold" onClick={downloadInvoice}>
              <FiDownload /> Download Invoice
            </button>
          </div>

          <div className="order-status-section">
            <div className="status-badge">{order.status}</div>
            <div className="payment-badge">
              {order.isPaid ? 'Paid' : 'Unpaid'}
            </div>
          </div>

          {user.role !== 'client' && order.client && (
            <div className="order-section">
              <h3>Client Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {order.client.name}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {order.client.email}
                </div>
                {order.client.phone && (
                  <div className="info-item">
                    <strong>Phone:</strong> {order.client.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="order-section">
            <h3>Order Items</h3>
            <div className="order-items-table">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <div className="item-details">
                    <h4>{item.title}</h4>
                    {item.color && (
                      <span className="item-color">Color: {item.color.name}</span>
                    )}
                  </div>
                  <div className="item-quantity">x{item.quantity}</div>
                  <div className="item-price">€{item.priceAtOrder.toFixed(2)}</div>
                  <div className="item-total">€{item.totalPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>€{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="total-row">
                <span>Discount:</span>
                <span>-€{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Tax (20%):</span>
              <span>€{order.tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="order-section">
              <h3>Notes</h3>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
