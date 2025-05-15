import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import React from 'react';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
  [key: string]: any; // To catch any extra props
}

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="contents">
      {children}
      <VercelAnalytics />
    </div>
  );
}
