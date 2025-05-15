import { CLSMetric, FCPMetric, Metric, LCPMetric, TTFBMetric } from 'web-vitals';

type MetricName = 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';

interface WebVitalMetric {
  id: string;
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  const nav = navigator as Navigator & { connection?: any };
  if (!nav.connection) return '';
  return 'effectiveType' in nav.connection ? nav.connection.effectiveType : '';
}

export function sendWebVitals(metric: any, options: { path: string; analyticsId: string; debug?: boolean }) {
  // Implement your logic to send web vitals data here
  if (options.debug) {
    console.log('Web Vitals Metric:', metric, 'Options:', options);
  }
  // Example: send data to analytics endpoint
}
