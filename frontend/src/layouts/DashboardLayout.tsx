import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useThemeStore } from '@/stores';
import { UserRole } from '@/types';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];

    const roleMenus = {
      [UserRole.ADMIN]: [
        { name: 'لوحة التحكم', path: '/dashboard/admin', icon: HomeIcon },
        { name: 'المستخدمين', path: '/dashboard/admin/users', icon: UsersIcon },
        { name: 'المنتجات', path: '/dashboard/admin/products', icon: CubeIcon },
        { name: 'الطلبات', path: '/dashboard/admin/orders', icon: ShoppingBagIcon },
        { name: 'نقطة البيع', path: '/pos', icon: ChartBarIcon },
      ],
      [UserRole.CLIENT]: [
        { name: 'لوحة التحكم', path: '/dashboard/client', icon: HomeIcon },
        { name: 'طلباتي', path: '/dashboard/client/orders', icon: ShoppingBagIcon },
        { name: 'الفواتير', path: '/dashboard/client/invoices', icon: DocumentTextIcon },
        { name: 'الكتالوج', path: '/products', icon: CubeIcon },
      ],
      [UserRole.COMMERCIAL]: [
        { name: 'لوحة التحكم', path: '/dashboard/commercial', icon: HomeIcon },
        { name: 'الكتالوج', path: '/products', icon: CubeIcon },
      ],
      [UserRole.STORE]: [
        { name: 'نقطة البيع', path: '/pos', icon: ChartBarIcon },
        { name: 'الكتالوج', path: '/products', icon: CubeIcon },
      ],
    };

    return roleMenus[user.role] || [];
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <>
      {/* Logo & Title */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">ملوك الخشب</h1>
            <p className="text-xs text-gray-500">Les Rois des Bois</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-gold text-white shadow-lg shadow-gold/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="w-5 h-5" />
              <span className="font-medium">الوضع النهاري</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5" />
              <span className="font-medium">الوضع الليلي</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white dark:bg-charcoal-light border-l border-gray-200 dark:border-gray-800 min-h-screen fixed right-0 top-0 bottom-0">
          <SidebarContent />
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-charcoal-light border-b border-gray-200 dark:border-gray-800 z-40">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-bold">ملوك الخشب</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-charcoal-light z-50 flex flex-col shadow-2xl">
              <SidebarContent />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:mr-72">
          <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
