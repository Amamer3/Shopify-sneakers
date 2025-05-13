
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader } from 'lucide-react';

// Use React.lazy for code splitting
const HomePage = React.lazy(() => import('./HomePage'));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <Loader className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ErrorFallback = () => (
  <div className="h-screen w-full flex items-center justify-center p-4">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">We're having trouble loading the page</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

const Index = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Index;
