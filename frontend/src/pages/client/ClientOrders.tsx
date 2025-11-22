import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBagIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { ordersAPI } from '@/api';
import { Order, OrderStatus, OrderLine } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';

export default function ClientOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['client-orders', { page, status }],
    queryFn: () =>
      ordersAPI.getAll({
        page,
        status: status || undefined,
      }),
  });

  const orders = data?.data?.items || [];
  const pagination = data?.data?.pagination;

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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

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

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: OrderStatus.NEW, label: 'جديد' },
    { value: OrderStatus.PROCESSING, label: 'قيد المعالجة' },
    { value: OrderStatus.READY, label: 'جاهز' },
    { value: OrderStatus.SHIPPED, label: 'تم الشحن' },
    { value: OrderStatus.DELIVERED, label: 'تم التسليم' },
    { value: OrderStatus.CANCELLED, label: 'ملغى' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">طلباتي</h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض وتتبع جميع طلباتك
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gold" />
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {status && (
            <button
              onClick={() => handleFilterChange('status', '')}
              className="text-sm text-gold hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: Order) => {
            const isExpanded = expandedOrders.has(order._id);

            return (
              <div key={order._id} className="card overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => toggleOrderExpansion(order._id)}
                  className="w-full p-6 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gold/10 rounded-lg">
                        <ShoppingBagIcon className="w-6 h-6 text-gold" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('ar-TN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg font-bold text-gold mt-1">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-charcoal-lighter">
                    {/* Order Lines */}
                    <div className="mb-6">
                      <h4 className="font-bold mb-4">المنتجات</h4>
                      <div className="space-y-3">
                        {order.lines.map((line: OrderLine, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white dark:bg-charcoal rounded-lg"
                          >
                            <div className="flex-1">
                              <h5 className="font-medium">
                                {getLocalizedString(line.titleAtOrder)}
                              </h5>
                              {line.componentSelections &&
                                Object.keys(line.componentSelections).length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    منتج مخصص ({Object.keys(line.componentSelections).length}{' '}
                                    مكونات)
                                  </p>
                                )}
                            </div>
                            <div className="text-left mr-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                الكمية: {line.qty}
                              </p>
                              <p className="font-bold text-gold">
                                {formatCurrency(line.lineTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="space-y-2 max-w-md mr-auto">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
                          <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discounts > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">الخصومات</span>
                            <span className="font-medium text-green-600">
                              -{formatCurrency(order.discounts)}
                            </span>
                          </div>
                        )}
                        {order.remise > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">التخفيض</span>
                            <span className="font-medium">{order.remise}%</span>
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">الضرائب</span>
                            <span className="font-medium">{formatCurrency(order.tax)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
                          <span className="font-bold">المجموع الإجمالي</span>
                          <span className="text-xl font-bold text-gold">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">المصدر: </span>
                          <span className="font-medium">
                            {order.source === 'catalog' ? 'الكتالوج' : 'نقطة البيع'}
                          </span>
                        </div>
                        {order.shippingDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">تاريخ الشحن: </span>
                            <span className="font-medium">
                              {new Date(order.shippingDate).toLocaleDateString('ar-TN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
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
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {status ? 'لا توجد طلبات بهذه الحالة' : 'لم تقم بأي طلبات بعد'}
          </p>
          {status && (
            <button onClick={() => handleFilterChange('status', '')} className="btn-secondary">
              عرض جميع الطلبات
            </button>
          )}
        </div>
      )}
    </div>
  );
}
