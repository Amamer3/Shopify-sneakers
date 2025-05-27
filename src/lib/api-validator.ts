const API_VERSION = '/api'; // Match the version from auth.ts

interface EndpointCheck {
  endpoint: string;
  method: string;
  testData?: any;
  requiresAuth: boolean;
}

const endpoints: EndpointCheck[] = [
  // Auth endpoints
  { endpoint: `${API_VERSION}/auth/login`, method: 'POST', testData: { email: 'test@example.com', password: 'password' }, requiresAuth: false },
  { endpoint: `${API_VERSION}/auth/register`, method: 'POST', testData: { email: 'test@example.com', password: 'password', name: 'Test User' }, requiresAuth: false },
  { endpoint: `${API_VERSION}/auth/refresh`, method: 'POST', requiresAuth: true },
  { endpoint: `${API_VERSION}/auth/validate`, method: 'GET', requiresAuth: true },
  { endpoint: `${API_VERSION}/auth/logout`, method: 'POST', requiresAuth: true },
  { endpoint: `${API_VERSION}/auth/forgot-password`, method: 'POST', testData: { email: 'test@example.com' }, requiresAuth: false },
  { endpoint: `${API_VERSION}/auth/reset-password`, method: 'POST', testData: { token: 'test-token', password: 'newpassword' }, requiresAuth: false },
  { endpoint: `${API_VERSION}/auth/verify-email`, method: 'POST', testData: { token: 'test-token' }, requiresAuth: false },

  // User profile endpoints
  { endpoint: `${API_VERSION}/user/profile`, method: 'PATCH', testData: { firstName: 'John', lastName: 'Doe' }, requiresAuth: true },
  { endpoint: `${API_VERSION}/user/addresses`, method: 'POST', testData: { street: '123 Main St', city: 'Test City', state: 'TS', zipCode: '12345', country: 'Test Country', isDefault: false }, requiresAuth: true },
  { endpoint: `${API_VERSION}/user/addresses/test-id`, method: 'PATCH', testData: { street: '124 Main St' }, requiresAuth: true },
  { endpoint: `${API_VERSION}/user/addresses/test-id`, method: 'DELETE', requiresAuth: true },

  // Order endpoints
  { endpoint: `${API_VERSION}/orders`, method: 'GET', requiresAuth: true },
  { endpoint: `${API_VERSION}/orders/create`, method: 'POST', testData: { items: [], shippingAddress: {} }, requiresAuth: true },
  { endpoint: `${API_VERSION}/orders/test-id`, method: 'GET', requiresAuth: true }
];

export async function validateEndpoints(): Promise<{ success: boolean; results: any[] }> {
  const results = [];
  let allSuccess = true;

  for (const check of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (check.requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(check.endpoint, {
        method: check.method,
        headers,
        body: check.testData ? JSON.stringify(check.testData) : undefined,
        credentials: 'include'
      });

      // We consider 401 a "success" for auth-required endpoints when not authenticated
      const isAuthFailureExpected = check.requiresAuth && !localStorage.getItem('token') && response.status === 401;
      
      results.push({
        endpoint: check.endpoint,
        method: check.method,
        status: response.status,
        success: response.ok || isAuthFailureExpected,
        requiresAuth: check.requiresAuth,
        error: !response.ok && !isAuthFailureExpected ? await response.text() : undefined
      });

      if (!response.ok && !isAuthFailureExpected) {
        allSuccess = false;
      }
    } catch (error) {
      results.push({
        endpoint: check.endpoint,
        method: check.method,
        success: false,
        requiresAuth: check.requiresAuth,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      allSuccess = false;
    }
  }

  return { success: allSuccess, results };
}
