import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { productsAPI } from '@/api';
import { Product, ProductVariant } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id,
  });

  const product = data?.data?.product;

  // Fetch related products (same category)
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.categories?.[0]],
    queryFn: () =>
      productsAPI.getAll({
        category: typeof product?.categories?.[0] === 'string'
          ? product.categories[0]
          : product?.categories?.[0]?._id,
        limit: 4,
      }),
    enabled: !!product?.categories?.[0],
  });

  const relatedProducts = relatedData?.data?.items.filter((p) => p._id !== id) || [];

  const handleAddToCart = () => {
    if (!product) return;

    // Check if variant is required but not selected
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error('الرجاء اختيار اللون');
      return;
    }

    addItem(product, quantity, selectedVariant);
    toast.success('تمت إضافة المنتج إلى السلة', {
      icon: '🛒',
      duration: 2000,
    });
  };

  const handleCustomize = () => {
    navigate(`/custom/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal py-8">
        <div className="container mx-auto px-4">
          <div className="skeleton h-6 w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton h-96"></div>
            <div className="space-y-6">
              <div className="skeleton h-12 w-3/4"></div>
              <div className="skeleton h-24"></div>
              <div className="skeleton h-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal py-8">
        <div className="container mx-auto px-4">
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم نتمكن من العثور على المنتج المطلوب
            </p>
            <Link to="/products" className="btn-primary">
              العودة إلى المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = selectedVariant?.image
    ? [selectedVariant.image, ...product.images]
    : product.images;

  const currentImage = displayImages[selectedImage] || displayImages[0];

  // Calculate available stock
  const availableStock = selectedVariant
    ? selectedVariant.stock
    : product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : 999; // Assume unlimited if no stock policy

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-gold transition-colors">
            الرئيسية
          </Link>
          <ArrowRightIcon className="w-4 h-4" />
          <Link to="/products" className="hover:text-gold transition-colors">
            المنتجات
          </Link>
          <ArrowRightIcon className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">
            {getLocalizedString(product.title)}
          </span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="card overflow-hidden bg-gray-100 dark:bg-charcoal-lighter aspect-square">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={getLocalizedString(product.title)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-9xl">🪑</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`card overflow-hidden aspect-square cursor-pointer transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-gold'
                        : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                    }`}
                  >
                    {image ? (
                      <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-charcoal-lighter flex items-center justify-center text-gray-400">
                        <CubeIcon className="w-8 h-8" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Special Product Badge */}
            {product.isSpecial && (
              <div className="card p-4 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20">
                <div className="flex items-center gap-3">
                  <StarIcon className="w-6 h-6 text-gold" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gold">منتج قابل للتخصيص</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      اختر المكونات وأنشئ تصميمك الفريد
                    </p>
                  </div>
                  <button onClick={handleCustomize} className="btn-primary whitespace-nowrap">
                    تخصيص الآن
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & SKU */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{getLocalizedString(product.title)}</h1>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {getLocalizedString(product.description)}
              </p>
            </div>

            {/* Price */}
            <div className="card p-6 bg-gradient-to-br from-gold/5 to-transparent border border-gold/10">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gold">
                  {formatCurrency(product.price.retail)}
                </span>
                <span className="text-gray-500">للقطعة الواحدة</span>
              </div>

              {/* Bulk Pricing */}
              {product.bulkPrices.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-3">أسعار الجملة:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.bulkPrices.map((bulk, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-white dark:bg-charcoal-light rounded px-3 py-2"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {bulk.minQty}+ قطعة
                        </span>
                        <span className="font-bold text-gold">{formatCurrency(bulk.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Variant Selector (Colors) */}
            {product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  اختر اللون
                  {selectedVariant && (
                    <span className="text-gold mr-2">
                      ({getLocalizedString(selectedVariant.colorName)})
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        if (variant.image) setSelectedImage(0);
                      }}
                      disabled={variant.stock === 0}
                      className={`relative px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant?._id === variant._id
                          ? 'border-gold bg-gold/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gold/50'
                      } ${
                        variant.stock === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <span className="font-medium">
                        {getLocalizedString(variant.colorName)}
                      </span>
                      {selectedVariant?._id === variant._id && (
                        <CheckCircleIcon className="w-5 h-5 text-gold absolute top-1 left-1" />
                      )}
                      {variant.stock === 0 && (
                        <span className="text-xs text-red-500 block">نفذ من المخزون</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium mb-3">الكمية</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-x-2 border-gray-300 dark:border-gray-600 py-2 bg-transparent focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {availableStock > 100 ? 'متوفر' : `متوفر ${availableStock} قطعة`}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {availableStock === 0 ? 'نفذ من المخزون' : 'أضف إلى السلة'}
              </button>
            </div>

            {/* Stock Warning */}
            {availableStock > 0 && availableStock <= 10 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  ⚠️ تنبيه: متبقي {availableStock} قطع فقط في المخزون
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">منتجات ذات صلة</h2>
              <Link to="/products" className="text-gold hover:underline text-sm">
                عرض الكل
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: Product) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct._id}`}
                  className="card-hover overflow-hidden group"
                  onClick={() => {
                    setSelectedImage(0);
                    setSelectedVariant(undefined);
                    setQuantity(1);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="relative bg-gray-100 dark:bg-charcoal-lighter h-48 overflow-hidden">
                    {relatedProduct.images[0] ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={getLocalizedString(relatedProduct.title)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-6xl">🪑</span>
                      </div>
                    )}
                    {relatedProduct.isSpecial && (
                      <div className="absolute top-2 right-2 badge bg-gold text-white text-xs">
                        قابل للتخصيص
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1">
                      {getLocalizedString(relatedProduct.title)}
                    </h3>
                    <p className="text-lg font-bold text-gold">
                      {formatCurrency(relatedProduct.price.retail)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
