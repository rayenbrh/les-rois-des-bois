import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const CommercialOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const togglePaid = async (id, isPaid) => {
    try {
      await api.patch(`/orders/${id}/paid`, { isPaid: !isPaid });
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>;

  return (
    <div>
      <h1 className="mb-3">Client Orders</h1>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td><Link to={`/order/${order._id}`}>{order.orderNumber}</Link></td>
                <td>{order.client?.name}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>€{order.total.toFixed(2)}</td>
                <td>
                  <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="form-control">
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <button className={`btn btn-sm ${order.isPaid ? 'btn-success' : 'btn-danger'}`} onClick={() => togglePaid(order._id, order.isPaid)}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </button>
                </td>
                <td>
                  <a href={`/api/pdf/invoice/${order._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-gold">Invoice</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommercialOrders;
