import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { sendWebVitals } from '@/lib/vitals';

export function useWebVitals(options: { path: string; analyticsId: string; debug?: boolean }) {
  useEffect(() => {
    // Core Web Vitals
    onCLS((metric) => sendWebVitals(metric, options));
    onFCP((metric) => sendWebVitals(metric, options));
    onINP((metric) => sendWebVitals(metric, options));
    onLCP((metric) => sendWebVitals(metric, options));
    onTTFB((metric) => sendWebVitals(metric, options));
  }, [options]);
}
