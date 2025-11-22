import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { useAuthStore } from '@/stores';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);

        toast.success(`مرحباً, ${response.data.user.name}!`);

        // Redirect based on role
        const rolePaths: Record<string, string> = {
          admin: '/dashboard/admin',
          client: '/dashboard/client',
          commercial: '/dashboard/commercial',
          store: '/pos',
        };

        navigate(rolePaths[response.data.user.role] || '/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl text-white">م</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">تسجيل الدخول</h1>
            <p className="text-gray-600 dark:text-gray-400">مرحباً بك في ملوك الخشب</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>حسابات تجريبية:</p>
            <p className="mt-2">Admin: admin@lesroisdebois.com / Admin123!</p>
            <p>Client: client1@example.com / Client123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
