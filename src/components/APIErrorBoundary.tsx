import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthenticationError } from '@/services/auth';

interface Props {
  error?: Error | null;
  resetError?: () => void;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class APIErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.error !== prevProps.error) {
      this.setState({
        hasError: !!this.props.error,
        error: this.props.error || null,
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.resetError?.();
  };

  public render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isAuthError = error instanceof AuthenticationError;

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="ml-2">
            {isAuthError ? 'Authentication Error' : 'Error Loading Data'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{error?.message || 'An unexpected error occurred.'}</p>
            {this.props.resetError && (
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
