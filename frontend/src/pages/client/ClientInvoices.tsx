import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { invoicesAPI } from '@/api';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function ClientInvoices() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const isPaidFilter = searchParams.get('isPaid');

  // Fetch invoices
  const { data, isLoading } = useQuery({
    queryKey: ['client-invoices', { page, isPaid: isPaidFilter }],
    queryFn: () =>
      invoicesAPI.getAll({
        page,
        isPaid: isPaidFilter === 'true' ? true : isPaidFilter === 'false' ? false : undefined,
      }),
  });

  const invoices = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  // Calculate totals
  const totalDue = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalRemaining = totalDue - totalPaid;

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

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      toast.loading('جاري تحميل الفاتورة...', { id: 'pdf-download' });
      const blob = await invoicesAPI.downloadPDF(invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تحميل الفاتورة بنجاح', { id: 'pdf-download' });
    } catch (error) {
      toast.error('فشل تحميل الفاتورة', { id: 'pdf-download' });
    }
  };

  const filterOptions = [
    { value: '', label: 'جميع الفواتير' },
    { value: 'false', label: 'غير مدفوعة' },
    { value: 'true', label: 'مدفوعة' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الفواتير والذمم</h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة جميع فواتيرك
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المبلغ المدفوع</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المبلغ المستحق</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gold" />
          <select
            value={isPaidFilter || ''}
            onChange={(e) => handleFilterChange('isPaid', e.target.value)}
            className="input"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isPaidFilter && (
            <button
              onClick={() => handleFilterChange('isPaid', '')}
              className="text-sm text-gold hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice: Invoice) => {
            const remainingAmount = invoice.amountDue - invoice.amountPaid;
            const paymentPercentage = (invoice.amountPaid / invoice.amountDue) * 100;

            return (
              <div key={invoice._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      invoice.isPaid
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-orange-100 dark:bg-orange-900/20'
                    }`}>
                      <DocumentTextIcon className={`w-6 h-6 ${
                        invoice.isPaid ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        تاريخ الإصدار: {new Date(invoice.createdAt).toLocaleDateString('ar-TN')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-TN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className={`badge ${
                      invoice.isPaid
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}>
                      {invoice.isPaid ? 'مدفوعة' : 'غير مدفوعة'}
                    </span>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      تقدم الدفع: {paymentPercentage.toFixed(0)}%
                    </span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amountPaid)} / {formatCurrency(invoice.amountDue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-charcoal-lighter rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        invoice.isPaid ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-charcoal-lighter rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">المبلغ الإجمالي</p>
                    <p className="font-bold text-gold">{formatCurrency(invoice.amountDue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">المبلغ المدفوع</p>
                    <p className="font-bold text-green-600">{formatCurrency(invoice.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">المبلغ المتبقي</p>
                    <p className="font-bold text-red-600">{formatCurrency(remainingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">عدد الدفعات</p>
                    <p className="font-bold">{invoice.payments.length}</p>
                  </div>
                </div>

                {/* Payment History */}
                {invoice.payments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold mb-3">سجل الدفعات</h4>
                    <div className="space-y-2">
                      {invoice.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-charcoal rounded-lg text-sm"
                        >
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            {payment.note && (
                              <p className="text-xs text-gray-500">{payment.note}</p>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(payment.date).toLocaleDateString('ar-TN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    تحميل PDF
                  </button>
                  {!invoice.isPaid && (
                    <div className="flex-1 text-left">
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        ⚠️ يرجى التواصل مع المسؤول لتسجيل الدفعات
                      </p>
                    </div>
                  )}
                </div>
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
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد فواتير</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isPaidFilter ? 'لا توجد فواتير بهذا التصنيف' : 'لم يتم إصدار أي فواتير بعد'}
          </p>
          {isPaidFilter && (
            <button onClick={() => handleFilterChange('isPaid', '')} className="btn-secondary">
              عرض جميع الفواتير
            </button>
          )}
        </div>
      )}
    </div>
  );
}
