import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal">
      {/* Sidebar and Header would go here */}
      <div className="flex">
        {/* Sidebar placeholder */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-charcoal-light border-r border-gray-200 dark:border-gray-800 min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gold">لوحة التحكم</h2>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
