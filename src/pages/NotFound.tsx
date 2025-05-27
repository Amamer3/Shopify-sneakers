import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define type for location state
interface LocationState {
  pathname: string;
  search: string;
}

export function NotFound() {
  const { toast } = useToast();
  const location = useLocation() as LocationState;

  useEffect(() => {
    const errorDetails = {
      pathname: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString(),
    };
    console.error('404 Error: User attempted to access non-existent route:', errorDetails);
    toast({
      variant: 'destructive',
      title: 'Page Not Found',
      description: `The page at ${location.pathname} does not exist.`,
    });
  }, [location.pathname, location.search, toast]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      role="alert"
      aria-label="404 Page Not Found"
    >
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-7xl sm:text-9xl font-bold text-primary" aria-hidden="true">
          404
        </h1>
        <div className="mt-6 space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-10">
          <Link to="/">
            <Button className="inline-flex items-center" aria-label="Return to homepage">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;