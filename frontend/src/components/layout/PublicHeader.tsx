import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeStore, useAuthStore, useCartStore } from '@/stores';

export default function PublicHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const { getItemCount } = useCartStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-charcoal/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-2xl text-white font-bold">م</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ملوك الخشب
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Les Rois des Bois</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                className="input pr-10"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost w-10 h-10 p-0 rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-gold" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gold" />
              )}
            </button>

            {/* Cart */}
            <Link to="/cart" className="btn-ghost relative w-10 h-10 p-0 rounded-full">
              <ShoppingCartIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-xs flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <Link
                to={`/dashboard/${user.role}`}
                className="btn-ghost gap-2 hidden sm:flex"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-sm">{user.name}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="input pr-10"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <ul className="flex gap-6 py-3 overflow-x-auto">
            <li>
              <Link
                to="/products"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gold transition-colors whitespace-nowrap"
              >
                جميع المنتجات
              </Link>
            </li>
            <li>
              <Link
                to="/products?isSpecial=true"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gold transition-colors whitespace-nowrap"
              >
                منتجات مخصصة
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gold transition-colors whitespace-nowrap"
              >
                من نحن
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gold transition-colors whitespace-nowrap"
              >
                اتصل بنا
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
