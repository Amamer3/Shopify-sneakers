import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the full URL including search params and hash
    const fullPath = location.pathname + location.search + location.hash;
    
    // Redirect to login page with return URL
    return (
      <Navigate 
        to="/login" 
        state={{ from: fullPath }} 
        replace 
      />
    );
  }

  return <>{children}</>;
}
