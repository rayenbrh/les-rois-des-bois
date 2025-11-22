import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBagIcon,
  FunnelIcon,
  DocumentTextIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { ordersAPI } from '@/api';
import { Order, OrderStatus, User } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || '';

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, status: statusFilter }],
    queryFn: () =>
      ordersAPI.getAll({
        page,
        status: statusFilter || undefined,
      }),
  });

  const orders = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم تحديث حالة الطلب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث حالة الطلب');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: OrderStatus.NEW, label: 'جديد' },
    { value: OrderStatus.PROCESSING, label: 'قيد المعالجة' },
    { value: OrderStatus.READY, label: 'جاهز' },
    { value: OrderStatus.SHIPPED, label: 'تم الشحن' },
    { value: OrderStatus.DELIVERED, label: 'تم التسليم' },
    { value: OrderStatus.CANCELLED, label: 'ملغى' },
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض ومتابعة وتحديث جميع الطلبات
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gold" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <button
              onClick={() => handleFilterChange('status', '')}
              className="text-sm text-gold hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-24"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-charcoal-lighter">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    رقم الطلب
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    العميل
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    المندوب
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    المصدر
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الحالة
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    المبلغ
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    التاريخ
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => {
                  const client = typeof order.clientId === 'object' ? order.clientId as User : null;
                  const commercial = typeof order.commercialId === 'object' ? order.commercialId as User : null;

                  return (
                    <tr
                      key={order._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.lines.length} منتج</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {client ? (
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {commercial?.name || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="badge text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          {order.source === 'catalog' ? 'كتالوج' : 'نقطة بيع'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                          className={`text-xs px-2 py-1 rounded-lg border-0 font-medium ${getStatusBadgeClass(
                            order.status
                          )}`}
                          disabled={updateStatusMutation.isPending}
                        >
                          {statusOptions.slice(1).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gold">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-gray-500">
                            الربح: {formatCurrency(order.netIncome)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors"
                            title="إنشاء فاتورة"
                          >
                            <DocumentTextIcon className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', String(page - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  السابق
                </button>

                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleFilterChange('page', String(i + 1))}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        page === i + 1
                          ? 'bg-gold text-white'
                          : 'bg-white dark:bg-charcoal-light hover:bg-gray-100 dark:hover:bg-charcoal-lighter'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleFilterChange('page', String(page + 1))}
                  disabled={page === pagination.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusFilter ? 'لا توجد طلبات بهذه الحالة' : 'لم يتم إنشاء أي طلبات بعد'}
          </p>
          {statusFilter && (
            <button onClick={() => handleFilterChange('status', '')} className="btn-secondary">
              عرض جميع الطلبات
            </button>
          )}
        </div>
      )}
    </div>
  );
}
