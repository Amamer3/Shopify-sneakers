import React, { useEffect, useState } from 'react';
import { validateEndpoints } from '@/lib/api-validator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export function APIHealthCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const validationResults = await validateEndpoints();
      setResults(validationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check API health');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Checking API health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={checkHealth} variant="outline" className="mt-2">
          Retry
        </Button>
      </Alert>
    );
  }

  if (!results) {
    return null;
  }

  const failedEndpoints = results.results.filter((r: any) => !r.success);

  return (
    <div className="space-y-4 p-4">
      <Alert variant={results.success ? "default" : "destructive"}>
        <AlertTitle>
          {results.success ? 'All APIs are working correctly' : 'Some APIs are not working correctly'}
        </AlertTitle>
        <AlertDescription>
          {failedEndpoints.length > 0 ? (
            <div className="mt-2">
              <p>Failed endpoints:</p>
              <ul className="list-disc pl-4 mt-1">
                {failedEndpoints.map((result: any, index: number) => (
                  <li key={index} className="text-sm">
                    {result.method} {result.endpoint} - {result.error || `Status: ${result.status}`}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
      
      <Button onClick={checkHealth} variant="outline" size="sm">
        Check Again
      </Button>
    </div>
  );
}
