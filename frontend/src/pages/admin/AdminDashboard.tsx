import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { analyticsAPI, usersAPI, productsAPI, ordersAPI } from '@/api';
import { Order, OrderStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores';

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);

  // Fetch all data
  const { data: usersData } = useQuery({
    queryKey: ['admin-users', { limit: 1 }],
    queryFn: () => usersAPI.getAll({ limit: 1 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products', { limit: 1 }],
    queryFn: () => productsAPI.getAll({ limit: 1 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders', { limit: 10 }],
    queryFn: () => ordersAPI.getAll({ limit: 10 }),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsAPI.getSalesAnalytics(),
  });

  const totalUsers = usersData?.data?.pagination.total || 0;
  const totalProducts = productsData?.data?.pagination.total || 0;
  const recentOrders = ordersData?.data?.items || [];
  const analytics = analyticsData?.data;

  const stats = [
    {
      name: 'إجمالي المستخدمين',
      value: totalUsers,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      link: '/dashboard/admin/users',
    },
    {
      name: 'إجمالي المنتجات',
      value: totalProducts,
      icon: CubeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      link: '/dashboard/admin/products',
    },
    {
      name: 'إجمالي الطلبات',
      value: analytics?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      link: '/dashboard/admin/orders',
    },
    {
      name: 'إجمالي المبيعات',
      value: formatCurrency(analytics?.totalSales || 0),
      icon: TrendingUpIcon,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      name: 'صافي الدخل',
      value: formatCurrency(analytics?.totalIncome || 0),
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      name: 'متوسط قيمة الطلب',
      value: formatCurrency(analytics?.averageOrderValue || 0),
      icon: DocumentTextIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
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
          لوحة تحكم المدير - نظرة عامة على النظام بالكامل
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.name}</p>
            {stat.link && (
              <Link to={stat.link} className="text-xs text-gold hover:underline">
                عرض التفاصيل ←
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">الطلبات الأخيرة</h2>
          <Link to="/dashboard/admin/orders" className="text-sm text-gold hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    رقم الطلب
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    العميل
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الحالة
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    المبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: Order) => {
                  const client = typeof order.clientId === 'object' ? order.clientId : null;
                  return (
                    <tr
                      key={order._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-sm">
                        {client?.name || client?.email || 'عميل'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Link to="/dashboard/admin/users" className="card-hover p-6 text-center">
          <UsersIcon className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="font-bold mb-1">إدارة المستخدمين</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">إضافة وتعديل المستخدمين</p>
        </Link>

        <Link to="/dashboard/admin/products" className="card-hover p-6 text-center">
          <CubeIcon className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="font-bold mb-1">إدارة المنتجات</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">إضافة وتعديل المنتجات</p>
        </Link>

        <Link to="/dashboard/admin/orders" className="card-hover p-6 text-center">
          <ShoppingBagIcon className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="font-bold mb-1">إدارة الطلبات</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">متابعة وتحديث الطلبات</p>
        </Link>

        <Link to="/pos" className="card-hover p-6 text-center">
          <DocumentTextIcon className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="font-bold mb-1">نقطة البيع</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">إنشاء مبيعات مباشرة</p>
        </Link>
      </div>
    </div>
  );
}
