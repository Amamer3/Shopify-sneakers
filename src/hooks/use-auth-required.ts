
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function useAuthRequired(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please log in to access this page'
      });
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isLoading, isAuthenticated };
}
