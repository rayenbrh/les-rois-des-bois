import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: '4rem 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="analytics-page">
      <h1>Analytics Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">€{analytics.totalRevenue?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="stat-card">
          <h3>Orders Revenue</h3>
          <div className="stat-value">€{analytics.totalOrderRevenue?.toFixed(2) || '0.00'}</div>
          <div className="stat-detail">Paid: €{analytics.paidOrderRevenue?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="stat-card">
          <h3>POS Sales</h3>
          <div className="stat-value">€{analytics.totalSalesRevenue?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="stat-card">
          <h3>Unpaid Orders</h3>
          <div className="stat-value">€{analytics.unpaidOrderRevenue?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(analytics.popularProducts || []).slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#d4af37" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-section">
        <h3>Order Statistics</h3>
        <div className="stats-list">
          <div className="stat-item">
            <span>Total Orders:</span>
            <span>{analytics.orderStats?.total || 0}</span>
          </div>
          <div className="stat-item">
            <span>New:</span>
            <span>{analytics.orderStats?.new || 0}</span>
          </div>
          <div className="stat-item">
            <span>In Progress:</span>
            <span>{analytics.orderStats?.inProgress || 0}</span>
          </div>
          <div className="stat-item">
            <span>Delivered:</span>
            <span>{analytics.orderStats?.delivered || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
