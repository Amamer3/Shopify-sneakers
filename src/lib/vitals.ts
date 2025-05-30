import { CLSMetric, FCPMetric, Metric, LCPMetric, TTFBMetric } from 'web-vitals';
import { logger } from './logger';

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

// Only log poor metrics or those in debug mode
function shouldLogMetric(metric: Metric, options: { debug?: boolean }) {
  if (options.debug) return true;
  const rating = (metric as any).rating;
  return rating === 'poor' || rating === 'needs-improvement';
}

// Rate limit vitals reporting to prevent excessive console output
let lastReportTime = 0;
const REPORT_THRESHOLD = 5000; // 5 seconds between reports

const sendToAnalytics = async (metric: WebVitalMetric, options: { path: string; analyticsId: string }) => {
  const body = {
    dsn: options.analyticsId,
    id: metric.id,
    page: options.path,
    href: location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
    rating: metric.rating,
    navigation_type: metric.navigationType,
    // Additional context
    device_memory: (navigator as any).deviceMemory,
    hardware_concurrency: navigator.hardwareConcurrency,
    viewport_width: window.innerWidth,
    timestamp: Date.now(),
  };

  try {
    // Use Beacon API if available, fallback to fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      const success = navigator.sendBeacon(vitalsUrl, blob);
      if (success) return;
    }

    // Fallback to fetch with retry logic
    const retryFetch = async (attempt = 1) => {
      try {
        const response = await fetch(vitalsUrl, {
          body: JSON.stringify(body),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          return retryFetch(attempt + 1);
        }
        throw error;
      }
    };

    await retryFetch();
  } catch (error) {
    logger.error('Failed to send web vitals', {
      error,
      metric: metric.name,
      value: metric.value
    });
  }
};

// Send web vitals data
export function sendWebVitals(metric: Metric, options: { path: string; analyticsId: string; debug?: boolean }) {
  // Only send metrics in production
  if (import.meta.env.DEV) {
    if (options.debug) {
      console.debug('[Web Vitals]', metric.name, metric.value);
    }
    return;
  }

  const now = Date.now();
  if (now - lastReportTime < REPORT_THRESHOLD) {
    return; // Skip if reported too recently
  }
  lastReportTime = now;

  // Filter out good metrics unless in debug mode
  if (!shouldLogMetric(metric, options)) {
    return;
  }

  const webVitalMetric: WebVitalMetric = {
    id: metric.id,
    name: metric.name as MetricName,
    value: metric.value,
    rating: (metric as any).rating,
    navigationType: (metric as any).navigationType
  };

  // Log to application logger at appropriate level
  if (webVitalMetric.rating === 'poor') {
    logger.warn('Poor Web Vital:', {
      metric: webVitalMetric.name,
      value: webVitalMetric.value,
      rating: webVitalMetric.rating
    });
  } else if (options.debug) {
    logger.debug('Web Vital:', {
      metric: webVitalMetric.name,
      value: webVitalMetric.value,
      rating: webVitalMetric.rating
    });
  }

  // Queue metric to be sent, using requestIdleCallback if available
  const sendMetric = () => sendToAnalytics(webVitalMetric, options);
  
  if (window.requestIdleCallback) {
    window.requestIdleCallback(sendMetric);
  } else {
    setTimeout(sendMetric, 0);
  }
}
