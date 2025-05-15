import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { Toaster } from '@/components/ui/sonner';

// Initialize health monitoring in development
if (process.env.NODE_ENV === 'development') {
  import('./lib/health').then(({ healthMonitor }) => {
    healthMonitor.startMonitoring(30000); // Check every 30 seconds in dev
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <>
    <App />
    <Toaster />
  </>
);

// Register service worker for PWA support
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('App is ready for offline use.');
  },
  onUpdate: (registration) => {
    // Show a toast notification when a new version is available
    const toast = document.createElement('div');
    toast.textContent = 'New version available! Please refresh to update.';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#000';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.cursor = 'pointer';
    toast.onclick = () => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    };
    document.body.appendChild(toast);
  },
});
