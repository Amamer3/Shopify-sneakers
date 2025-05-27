import { toast } from 'sonner';
import { AuthenticationError, TokenExpiredError } from '@/services/auth';

export type RequestConfig = {
  maxRetries?: number;
  retryDelay?: number;
  silentError?: boolean;
  requiresAuth?: boolean;
};

const defaultConfig: Required<RequestConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  silentError: false,
  requiresAuth: true,
};

/**
 * Wraps API requests with automatic error handling, retries, and toast notifications
 */
export async function withErrorHandling<T>(
  requestFn: () => Promise<T>,
  config?: RequestConfig
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < finalConfig.maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      // Don't retry on validation errors or non-auth errors if auth is not required
      if (error instanceof AuthenticationError) {
        if (error instanceof TokenExpiredError && finalConfig.requiresAuth) {
          // Let the auth service handle token expiration
          throw error;
        }
        break;
      }

      // Increment attempt and check if we should retry
      attempt++;
      if (attempt < finalConfig.maxRetries) {
        // Wait before retrying, using exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, finalConfig.retryDelay * Math.pow(2, attempt - 1))
        );
        continue;
      }
    }
  }

  // If we get here, all retries failed
  if (!finalConfig.silentError && lastError) {
    const message = lastError instanceof AuthenticationError 
      ? lastError.message 
      : 'An error occurred. Please try again.';
    
    toast.error(message);
  }

  throw lastError;
}

/**
 * Utility to format API error messages for display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Remove technical details from the message
    return error.message.replace(/^(?:Error|TypeError|ApiError):\s*/i, '');
  }
  
  return 'An unexpected error occurred';
}
