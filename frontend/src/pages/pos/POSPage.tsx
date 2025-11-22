import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { productsAPI } from '@/api';
import { Product } from '@/types';
import { getLocalizedString, formatCurrency } from '@/lib/utils';
import { usePOSStore } from '@/stores';

interface POSCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [search, setSearch] = useState('');
  const [remise, setRemise] = useState(0);
  const { saleMode, setSaleMode } = usePOSStore();

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['pos-products', { search }],
    queryFn: () =>
      productsAPI.getAll({
        search: search || undefined,
        limit: 20,
      }),
  });

  const products = data?.data?.items || [];

  const addToCart = (product: Product) => {
    const price = saleMode === 'gros' && product.bulkPrices.length > 0
      ? product.bulkPrices[0].price
      : product.price.retail;

    const existingItemIndex = cart.findIndex((item) => item.product._id === product._id);

    if (existingItemIndex !== -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].total = newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice: price,
          total: price,
        },
      ]);
    }

    toast.success('تمت الإضافة', { duration: 1000 });
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = quantity;
    newCart[index].total = quantity * newCart[index].unitPrice;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setRemise(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const remiseAmount = (subtotal * remise) / 100;
    return subtotal - remiseAmount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    // Placeholder for checkout logic
    toast.success('تم إتمام البيع بنجاح!');
    clearCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal">
      {/* Header */}
      <div className="bg-white dark:bg-charcoal-light border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShoppingCartIcon className="w-8 h-8 text-gold" />
            <div>
              <h1 className="text-2xl font-bold">نقطة البيع</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                نظام البيع السريع
              </p>
            </div>
          </div>

          {/* Sale Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaleMode('detail')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saleMode === 'detail'
                  ? 'bg-gold text-white'
                  : 'bg-gray-100 dark:bg-charcoal-lighter text-gray-600 dark:text-gray-400'
              }`}
            >
              بيع تجزئة
            </button>
            <button
              onClick={() => setSaleMode('gros')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saleMode === 'gros'
                  ? 'bg-gold text-white'
                  : 'bg-gray-100 dark:bg-charcoal-lighter text-gray-600 dark:text-gray-400'
              }`}
            >
              بيع جملة
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="card p-4 mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="input pr-10"
                />
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton h-48"></div>
                ))
              ) : products.length > 0 ? (
                products.map((product: Product) => {
                  const price = saleMode === 'gros' && product.bulkPrices.length > 0
                    ? product.bulkPrices[0].price
                    : product.price.retail;

                  return (
                    <button
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className="card-hover p-3 text-right hover:shadow-lg transition-all"
                    >
                      <div className="bg-gray-100 dark:bg-charcoal-lighter rounded-lg mb-2 h-32 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={getLocalizedString(product.title)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🪑</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {getLocalizedString(product.title)}
                      </h3>
                      <p className="font-bold text-gold">{formatCurrency(price)}</p>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full card p-12 text-center">
                  <p className="text-gray-500">لا توجد منتجات</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">السلة</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:underline"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">السلة فارغة</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-charcoal-lighter rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm flex-1">
                          {getLocalizedString(item.product.title)}
                        </h4>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-charcoal rounded"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-charcoal rounded"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-left">
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </p>
                          <p className="font-bold text-gold">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount */}
              {cart.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-2">التخفيض (%)</label>
                  <input
                    type="number"
                    value={remise}
                    onChange={(e) =>
                      setRemise(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))
                    }
                    className="input"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {remise > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">التخفيض ({remise}%)</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency((calculateSubtotal() * remise) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-lg">الإجمالي</span>
                    <span className="font-bold text-2xl text-gold">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentTextIcon className="w-5 h-5" />
                إتمام البيع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
