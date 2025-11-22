import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { productsAPI } from '@/api';
import { Product } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';
import ProductFormModal from '@/components/modals/ProductFormModal';

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const isSpecialFilter = searchParams.get('isSpecial');

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { page, isSpecial: isSpecialFilter }],
    queryFn: () =>
      productsAPI.getAll({
        page,
        isSpecial:
          isSpecialFilter === 'true'
            ? true
            : isSpecialFilter === 'false'
            ? false
            : undefined,
      }),
  });

  const products = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productsAPI.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج');
    },
  });

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${getLocalizedString(product.title)}"؟`)) {
      deleteMutation.mutate(product._id);
    }
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

  const filterOptions = [
    { value: '', label: 'جميع المنتجات' },
    { value: 'false', label: 'منتجات عادية' },
    { value: 'true', label: 'منتجات قابلة للتخصيص' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إضافة وتعديل وحذف المنتجات
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gold" />
          <select
            value={isSpecialFilter || ''}
            onChange={(e) => handleFilterChange('isSpecial', e.target.value)}
            className="input"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isSpecialFilter && (
            <button
              onClick={() => handleFilterChange('isSpecial', '')}
              className="text-sm text-gold hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-24"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-charcoal-lighter">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    المنتج
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    SKU
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    السعر
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    التكلفة
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    النوع
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الألوان
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-charcoal-lighter overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={getLocalizedString(product.title)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <CubeIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {getLocalizedString(product.title)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {getLocalizedString(product.description)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-mono">{product.sku}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-gold">
                          {formatCurrency(product.price.retail)}
                        </p>
                        {product.bulkPrices.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {product.bulkPrices.length} أسعار جملة
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(product.cost)}
                    </td>
                    <td className="py-4 px-6">
                      {product.isSpecial ? (
                        <span className="badge bg-gold/10 text-gold text-xs flex items-center gap-1 w-fit">
                          <StarIcon className="w-3 h-3" />
                          قابل للتخصيص
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs w-fit">
                          عادي
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {product.variants.length > 0 ? (
                        <span className="text-gray-600 dark:text-gray-400">
                          {product.variants.length} لون
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors"
                          title="عرض"
                        >
                          <CubeIcon className="w-4 h-4 text-gray-600" />
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <PencilIcon className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isSpecialFilter
              ? 'لا توجد منتجات بهذا التصنيف'
              : 'ابدأ بإضافة المنتجات'}
          </p>
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="w-5 h-5 inline ml-2" />
            إضافة منتج جديد
          </button>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
