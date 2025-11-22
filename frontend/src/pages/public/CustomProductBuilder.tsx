import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { productsAPI } from '@/api';
import { SubProduct } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores';

export default function CustomProductBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [componentSelections, setComponentSelections] = useState<Record<string, SubProduct>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch product details
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id,
  });

  const product = data?.data?.product;

  // Check if product is special
  useEffect(() => {
    if (product && !product.isSpecial) {
      toast.error('هذا المنتج غير قابل للتخصيص');
      navigate(`/products/${id}`);
    }
  }, [product, id, navigate]);

  const components = product?.specialConfig?.components || [];

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!product) return 0;

    let total = product.price.retail;
    Object.values(componentSelections).forEach((subProduct) => {
      total += subProduct.extraPrice;
    });
    return total;
  };

  const handleComponentSelect = (componentName: string, subProduct: SubProduct) => {
    setComponentSelections((prev) => ({
      ...prev,
      [componentName]: subProduct,
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if all components are selected
    const requiredComponents = components.length;
    const selectedComponents = Object.keys(componentSelections).length;

    if (selectedComponents < requiredComponents) {
      toast.error('الرجاء اختيار جميع المكونات');
      return;
    }

    addItem(product, quantity, undefined, componentSelections);
    toast.success('تمت إضافة المنتج المخصص إلى السلة', {
      icon: '✨',
      duration: 2000,
    });
  };

  const allComponentsSelected = components.length > 0 &&
    Object.keys(componentSelections).length === components.length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal py-8">
        <div className="container mx-auto px-4">
          <div className="skeleton h-6 w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 skeleton h-96"></div>
            <div className="skeleton h-96"></div>
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
          <Link to={`/products/${id}`} className="hover:text-gold transition-colors">
            {getLocalizedString(product.title)}
          </Link>
          <ArrowRightIcon className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">تخصيص المنتج</span>
        </nav>

        {/* Header */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20">
          <div className="flex items-center gap-4">
            <SparklesIcon className="w-8 h-8 text-gold" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{getLocalizedString(product.title)}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                صمم منتجك الفريد من خلال اختيار المكونات المفضلة لديك
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            {components.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  {components.map((component, index) => {
                    const isSelected = !!componentSelections[component.name];
                    const isCurrent = index === currentStep;

                    return (
                      <div key={index} className="flex items-center flex-1">
                        <button
                          onClick={() => setCurrentStep(index)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                            isSelected
                              ? 'bg-gold text-white'
                              : isCurrent
                              ? 'bg-gold/20 text-gold border-2 border-gold'
                              : 'bg-gray-200 dark:bg-charcoal-lighter text-gray-500'
                          }`}
                        >
                          {isSelected ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                        </button>
                        {index < components.length - 1 && (
                          <div
                            className={`h-1 flex-1 mx-2 ${
                              isSelected ? 'bg-gold' : 'bg-gray-200 dark:bg-charcoal-lighter'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    الخطوة {currentStep + 1} من {components.length}:{' '}
                    <span className="font-bold">{components[currentStep]?.name}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Component Options */}
            {components.length > 0 && components[currentStep] && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold mb-6">
                  اختر {components[currentStep].name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(components[currentStep].subProductIds as SubProduct[]).map((subProduct) => {
                    const isSelected =
                      componentSelections[components[currentStep].name]?._id === subProduct._id;

                    return (
                      <button
                        key={subProduct._id}
                        onClick={() =>
                          handleComponentSelect(components[currentStep].name, subProduct)
                        }
                        className={`card-hover p-4 text-right transition-all ${
                          isSelected
                            ? 'ring-2 ring-gold bg-gold/5'
                            : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                        }`}
                      >
                        {/* Image */}
                        <div className="relative bg-gray-100 dark:bg-charcoal-lighter rounded-lg overflow-hidden mb-3 aspect-square">
                          {subProduct.images[0] ? (
                            <img
                              src={subProduct.images[0]}
                              alt={getLocalizedString(subProduct.title)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <CubeIcon className="w-12 h-12" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-gold text-white rounded-full p-1">
                              <CheckCircleIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <h3 className="font-bold mb-1">
                          {getLocalizedString(subProduct.title)}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">SKU: {subProduct.sku}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gold font-bold">
                            {subProduct.extraPrice > 0
                              ? `+${formatCurrency(subProduct.extraPrice)}`
                              : 'مشمول'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {subProduct.stock > 0
                              ? `متوفر (${subProduct.stock})`
                              : 'نفذ من المخزون'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="btn-secondary disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentStep(Math.min(components.length - 1, currentStep + 1))}
                    disabled={currentStep === components.length - 1}
                    className="btn-primary disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* No Components Available */}
            {components.length === 0 && (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold mb-2">لا توجد مكونات متاحة</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  هذا المنتج لا يحتوي على مكونات قابلة للتخصيص حالياً
                </p>
                <Link to={`/products/${id}`} className="btn-primary">
                  عرض المنتج الأساسي
                </Link>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-6">
              {/* Preview Image */}
              <div className="bg-gray-100 dark:bg-charcoal-lighter rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={getLocalizedString(product.title)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <span className="text-9xl">🪑</span>
                  </div>
                )}
              </div>

              {/* Selected Components Summary */}
              <div>
                <h3 className="font-bold mb-3">المكونات المختارة</h3>
                {Object.keys(componentSelections).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    لم يتم اختيار أي مكونات بعد
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(componentSelections).map(([componentName, subProduct]) => (
                      <div
                        key={componentName}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-charcoal-lighter rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">{componentName}</p>
                          <p className="font-medium text-sm">
                            {getLocalizedString(subProduct.title)}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-gold">
                          {subProduct.extraPrice > 0
                            ? `+${formatCurrency(subProduct.extraPrice)}`
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">السعر الأساسي</span>
                  <span className="font-medium">{formatCurrency(product.price.retail)}</span>
                </div>
                {Object.values(componentSelections).map((subProduct, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {getLocalizedString(subProduct.title)}
                    </span>
                    <span className="font-medium">
                      {subProduct.extraPrice > 0
                        ? `+${formatCurrency(subProduct.extraPrice)}`
                        : '—'}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
                  <span className="font-bold">السعر الإجمالي</span>
                  <span className="text-2xl font-bold text-gold">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium mb-3">الكمية</label>
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
                    className="flex-1 text-center border-x-2 border-gray-300 dark:border-gray-600 py-2 bg-transparent focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!allComponentsSelected}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {allComponentsSelected ? 'أضف إلى السلة' : 'اختر جميع المكونات'}
              </button>

              {/* Back to Product Link */}
              <Link
                to={`/products/${id}`}
                className="btn-secondary w-full text-center block"
              >
                العودة للمنتج الأساسي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
