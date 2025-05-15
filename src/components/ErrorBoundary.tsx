
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    import('../lib/logger').then(({ logger }) => {
      logger.error('Uncaught error in component', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        stack: error.stack
      });
    });
  }

  private handleReload = () => {
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center w-full h-screen p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="text-lg font-semibold mb-2">Something went wrong</AlertTitle>
              <AlertDescription className="text-sm">
                <p className="mb-4">We're sorry, but an unexpected error occurred.</p>
                {this.state.error && (
                  <div className="bg-destructive/10 p-2 rounded-md text-xs font-mono mb-4 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
