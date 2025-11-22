import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '@/api';

export default function HomePage() {
  // Fetch featured products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { limit: 6 }],
    queryFn: () => productsAPI.getAll({ limit: 6 }),
  });

  const products = productsData?.data?.items || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in">
              <span className="text-gold-gradient">ملوك الخشب</span>
            </h1>

            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-200">
              Les Rois des Bois
            </h2>

            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              اكتشف أجود أنواع الأثاث الخشبي الفاخر المصنوع يدوياً
              <br />
              بجودة عالمية وتصاميم عصرية تليق بمنزلك
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-3">
                تصفح المنتجات
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>

              <Link to="/products?isSpecial=true" className="btn-outline text-lg px-8 py-3">
                المنتجات المخصصة
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-charcoal-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">جودة عالية</h3>
              <p className="text-gray-600 dark:text-gray-400">
                مصنوعة من أجود أنواع الخشب الطبيعي بحرفية عالية
              </p>
            </div>

            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">تصاميم فريدة</h3>
              <p className="text-gray-600 dark:text-gray-400">
                تصاميم عصرية ومبتكرة تناسب جميع الأذواق
              </p>
            </div>

            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">تخصيص كامل</h3>
              <p className="text-gray-600 dark:text-gray-400">
                صمم منتجك الخاص باختيار المكونات والألوان
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">منتجاتنا المميزة</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              اكتشف مجموعة مختارة من أفخم منتجاتنا
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-64 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-6 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card-hover overflow-hidden group"
                >
                  <div className="relative h-64 bg-gray-100 dark:bg-charcoal-lighter overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title.ar}
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

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">
                      {product.title.ar}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description.ar}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gold">
                        {product.price.retail.toFixed(2)} د.ت
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary text-lg px-8 py-3">
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            هل تبحث عن منتج خاص؟
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            نوفر لك إمكانية تصميم منتجك الخاص باختيار المواد والألوان والتصميم
          </p>
          <Link to="/products?isSpecial=true" className="btn bg-white text-gold hover:bg-gray-100 text-lg px-8 py-3">
            ابدأ التخصيص الآن
          </Link>
        </div>
      </section>
    </div>
  );
}
