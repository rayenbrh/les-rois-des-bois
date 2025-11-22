import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths: Record<UserRole, string> = {
      [UserRole.ADMIN]: '/dashboard/admin',
      [UserRole.CLIENT]: '/dashboard/client',
      [UserRole.COMMERCIAL]: '/dashboard/commercial',
      [UserRole.STORE]: '/pos',
    };

    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}
