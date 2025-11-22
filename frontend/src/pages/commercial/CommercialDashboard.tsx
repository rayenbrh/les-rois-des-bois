import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { analyticsAPI, ordersAPI } from '@/api';
import { Order, Product, OrderStatus } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores';

export default function CommercialDashboard() {
  const user = useAuthStore((state) => state.user);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['commercial-analytics', dateRange, user?.id],
    queryFn: () => analyticsAPI.getSalesAnalytics({
      ...getDateRange(),
      commercialId: user?.id,
    }),
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['commercial-orders', { limit: 10 }],
    queryFn: () => ordersAPI.getAll({ limit: 10 }),
  });

  const analytics = analyticsData?.data;
  const recentOrders = ordersData?.data?.items || [];

  // Stats
  const stats = [
    {
      name: 'إجمالي المبيعات',
      value: formatCurrency(analytics?.totalSales || 0),
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'عدد الطلبات',
      value: analytics?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'صافي الدخل',
      value: formatCurrency(analytics?.totalIncome || 0),
      icon: TrendingUpIcon,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      name: 'متوسط قيمة الطلب',
      value: formatCurrency(analytics?.averageOrderValue || 0),
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  const getStatusBadgeClass = (status: OrderStatus) => {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.NEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      [OrderStatus.PROCESSING]:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      [OrderStatus.READY]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      [OrderStatus.SHIPPED]:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      [OrderStatus.DELIVERED]:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return classes[status] || '';
  };

  const getStatusText = (status: OrderStatus) => {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.NEW]: 'جديد',
      [OrderStatus.PROCESSING]: 'قيد المعالجة',
      [OrderStatus.READY]: 'جاهز',
      [OrderStatus.SHIPPED]: 'تم الشحن',
      [OrderStatus.DELIVERED]: 'تم التسليم',
      [OrderStatus.CANCELLED]: 'ملغى',
    };
    return texts[status] || status;
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          لوحة تحكم المندوب التجاري - نظرة عامة على أداء المبيعات
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="card p-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">الفترة الزمنية:</span>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 dark:bg-charcoal-lighter hover:bg-gray-200 dark:hover:bg-charcoal'
                }`}
              >
                {range === 'week' && 'أسبوع'}
                {range === 'month' && 'شهر'}
                {range === 'year' && 'سنة'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-32"></div>)
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">المنتجات الأكثر مبيعاً</h2>
              <ChartBarIcon className="w-5 h-5 text-gold" />
            </div>

            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((item, index) => {
                const product = item.product as Product;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-charcoal-lighter rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/20 text-gold font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {getLocalizedString(product.title)}
                        </h4>
                        <p className="text-xs text-gray-500">{item.sales} مبيعات</p>
                      </div>
                    </div>
                    <span className="font-bold text-gold">{formatCurrency(item.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">الطلبات الأخيرة</h2>
            <ShoppingBagIcon className="w-5 h-5 text-gold" />
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20"></div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order: Order) => (
                <div
                  key={order._id}
                  className="p-4 bg-gray-50 dark:bg-charcoal-lighter rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{order.orderNumber}</span>
                    <span className={`badge text-xs ${getStatusBadgeClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.lines.length} منتج
                    </span>
                    <span className="font-bold text-gold">{formatCurrency(order.total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد طلبات بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Sales by Date Chart (Simple table representation) */}
      {analytics?.salesByDate && analytics.salesByDate.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">المبيعات حسب التاريخ</h2>
            <TrendingUpIcon className="w-5 h-5 text-gold" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    التاريخ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    عدد الطلبات
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    إجمالي المبيعات
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.salesByDate.slice(0, 10).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    <td className="py-3 px-4 text-sm">
                      {new Date(item.date).toLocaleDateString('ar-TN')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{item.count}</td>
                    <td className="py-3 px-4 text-sm font-bold text-gold">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
