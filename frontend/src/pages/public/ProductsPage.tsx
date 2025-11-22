import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { productsAPI } from '@/api';
import { Product } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const isSpecial = searchParams.get('isSpecial');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search, category, isSpecial, minPrice, maxPrice }],
    queryFn: () =>
      productsAPI.getAll({
        page,
        search,
        category: category || undefined,
        isSpecial: isSpecial === 'true' ? true : isSpecial === 'false' ? false : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      }),
  });

  const products = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">جميع المنتجات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            اكتشف مجموعتنا الكاملة من الأثاث الخشبي الفاخر
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-gold" />
                  الفلاتر
                </h2>
                <button onClick={clearFilters} className="text-sm text-gold hover:underline">
                  مسح الكل
                </button>
              </div>

              {/* Product Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">نوع المنتج</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={!isSpecial}
                      onChange={() => handleFilterChange('isSpecial', '')}
                      className="text-gold focus:ring-gold"
                    />
                    <span className="text-sm">جميع المنتجات</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={isSpecial === 'false'}
                      onChange={() => handleFilterChange('isSpecial', 'false')}
                      className="text-gold focus:ring-gold"
                    />
                    <span className="text-sm">منتجات عادية</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={isSpecial === 'true'}
                      onChange={() => handleFilterChange('isSpecial', 'true')}
                      className="text-gold focus:ring-gold"
                    />
                    <span className="text-sm">منتجات قابلة للتخصيص</span>
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">نطاق السعر (د.ت)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input text-sm py-2"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input text-sm py-2"
                  />
                </div>
              </div>

              {/* Active Filters */}
              {(search || category || isSpecial || minPrice || maxPrice) && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium mb-2">الفلاتر النشطة:</p>
                  <div className="space-y-1">
                    {search && (
                      <div className="badge bg-gold/10 text-gold text-xs">
                        البحث: {search}
                      </div>
                    )}
                    {isSpecial === 'true' && (
                      <div className="badge bg-gold/10 text-gold text-xs">منتجات مخصصة</div>
                    )}
                    {(minPrice || maxPrice) && (
                      <div className="badge bg-gold/10 text-gold text-xs">
                        السعر: {minPrice || '0'} - {maxPrice || '∞'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="card p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pagination && (
                    <>
                      عرض {products.length} من أصل {pagination.total} منتج
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-gold text-white'
                        : 'bg-gray-100 dark:bg-charcoal-lighter'
                    }`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-gold text-white'
                        : 'bg-gray-100 dark:bg-charcoal-lighter'
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton h-48"></div>
                    <div className="p-4 space-y-3">
                      <div className="skeleton h-6 w-3/4"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid/List */}
            {!isLoading && products.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {products.map((product: Product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className={`card-hover overflow-hidden group ${
                        viewMode === 'list' ? 'flex flex-row' : ''
                      }`}
                    >
                      <div
                        className={`relative bg-gray-100 dark:bg-charcoal-lighter overflow-hidden ${
                          viewMode === 'list' ? 'w-48 h-48' : 'h-64'
                        }`}
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={getLocalizedString(product.title)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-6xl">🪑</span>
                          </div>
                        )}
                        {product.isSpecial && (
                          <div className="absolute top-4 right-4 badge bg-gold text-white">
                            قابل للتخصيص
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1">
                        <h3 className="text-lg font-bold mb-2 line-clamp-1">
                          {getLocalizedString(product.title)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {getLocalizedString(product.description)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gold">
                            {formatCurrency(product.price.retail)}
                          </span>
                          {product.bulkPrices.length > 0 && (
                            <span className="text-xs text-gray-500">أسعار الجملة متاحة</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

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
              </>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  جرب تغيير الفلاتر للعثور على منتجات
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  مسح الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
