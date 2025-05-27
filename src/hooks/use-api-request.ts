import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  maxRetries?: number
  retryDelay?: number
}

export function useApiRequest<T>({
  onSuccess,
  onError,
  maxRetries = 3,
  retryDelay = 1000,
}: UseApiRequestOptions<T> = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (apiCall: () => Promise<T>, retryCount = 0) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiCall()
        onSuccess?.(result)
        setIsLoading(false)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred')
        
        if (retryCount < maxRetries) {
          toast.error(`Request failed. Retrying... (${retryCount + 1}/${maxRetries})`)
          
          // Wait for the retry delay
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          
          // Recursive retry
          return execute(apiCall, retryCount + 1)
        }

        setError(error)
        onError?.(error)
        toast.error('Request failed after multiple attempts')
        setIsLoading(false)
        throw error
      }
    },
    [maxRetries, retryDelay, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    execute,
    reset,
    isLoading,
    error,
  }
}
