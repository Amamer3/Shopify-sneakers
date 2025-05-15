import React from 'react';
import { useLocation } from 'react-router-dom';
import { useWebVitals } from '@/hooks/use-web-vitals';


const ANALYTICS_ID = import.meta.env.VITE_VERCEL_ANALYTICS_ID || 'development';

interface WebVitalsProviderProps {
  children: React.ReactNode;
}

export function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  const location = useLocation();
  
  useWebVitals({
    path: location.pathname,
    analyticsId: ANALYTICS_ID,
    debug: import.meta.env.DEV,
  });

  return <>{children}</>;
}
