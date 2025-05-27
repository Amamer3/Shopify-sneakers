import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({ children, requireAuth = true, requireAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      toast.error('Please log in to access this page');
      navigate('/login', { replace: true });
      return;
    }

    if (requireAdmin && !user?.isAdmin) {
      toast.error('Access denied: Admin privileges required');
      navigate('/', { replace: true });
      return;
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requireAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
