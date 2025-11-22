import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { usersAPI } from '@/api';
import { User, UserRole } from '@/types';

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const roleFilter = searchParams.get('role') || '';

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, role: roleFilter }],
    queryFn: () =>
      usersAPI.getAll({
        page,
        role: roleFilter || undefined,
      }),
  });

  const users = data?.data?.items || [];
  const pagination = data?.data?.pagination;

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

  const roleOptions = [
    { value: '', label: 'جميع الأدوار' },
    { value: UserRole.ADMIN, label: 'مدير' },
    { value: UserRole.CLIENT, label: 'عميل' },
    { value: UserRole.COMMERCIAL, label: 'مندوب تجاري' },
    { value: UserRole.STORE, label: 'متجر' },
  ];

  const getRoleBadgeClass = (role: UserRole) => {
    const classes: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      [UserRole.CLIENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      [UserRole.COMMERCIAL]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      [UserRole.STORE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    };
    return classes[role] || '';
  };

  const getRoleText = (role: UserRole) => {
    const texts: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'مدير',
      [UserRole.CLIENT]: 'عميل',
      [UserRole.COMMERCIAL]: 'مندوب تجاري',
      [UserRole.STORE]: 'متجر',
    };
    return texts[role] || role;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إضافة وتعديل وحذف المستخدمين
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gold" />
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="input"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {roleFilter && (
            <button
              onClick={() => handleFilterChange('role', '')}
              className="text-sm text-gold hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20"></div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-charcoal-lighter">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الاسم
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    البريد الإلكتروني
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الدور
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الهاتف
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الحالة
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    آخر تسجيل دخول
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.assignedCommercial && typeof user.assignedCommercial === 'object' && (
                            <p className="text-xs text-gray-500">
                              مندوب: {user.assignedCommercial.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`badge text-xs ${getRoleBadgeClass(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {user.phone || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`badge text-xs ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}
                      >
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('ar-TN')
                        : 'لم يسجل دخول'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal rounded-lg transition-colors">
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
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا يوجد مستخدمون</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {roleFilter ? 'لا يوجد مستخدمون بهذا الدور' : 'ابدأ بإضافة المستخدمين'}
          </p>
          <button className="btn-primary">
            <PlusIcon className="w-5 h-5 inline ml-2" />
            إضافة مستخدم جديد
          </button>
        </div>
      )}
    </div>
  );
}
