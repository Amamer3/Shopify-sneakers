import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[80vh] p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle className="text-lg font-semibold mb-2">Page Error</AlertTitle>
          <AlertDescription className="text-sm">
            <p className="mb-4">We're sorry, but something went wrong with this page.</p>
            {error && (
              <div className="bg-destructive/10 p-2 rounded-md text-xs font-mono mb-4 overflow-auto max-h-32">
                {error.message || error.toString()}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReload}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
