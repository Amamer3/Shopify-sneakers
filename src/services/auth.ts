const API_URL = 'https://shopify-server-ws3z.onrender.com';
const API_VERSION = '/api';  // Adding API version prefix

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

export const authService = {
  async register(data: RegisterData) {
    try {      const url = `${API_URL}${API_VERSION}/auth/register`;
      console.log('Sending registration request to:', url);
      console.log('Registration data:', { 
        email: data.email, 
        name: data.name,
        // Don't log the actual password
        hasPassword: !!data.password 
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' })) as ErrorResponse;
        console.error('Registration error:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      console.log('Registration successful:', { 
        success: true, 
        hasToken: !!result.token 
      });
      return result;
    } catch (error) {
      console.error('Registration request failed:', error);
      throw error;
    }
  },

  async login(data: LoginData) {
    const response = await fetch(`${API_URL}${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const result = await response.json();
    // Store the JWT token in localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}${API_VERSION}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send password reset email');
    }

    return response.json();
  },

  async resetPassword(data: ResetPasswordData) {    const response = await fetch(`${API_URL}${API_VERSION}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  },

  async verifyEmail(token: string) {    const response = await fetch(`${API_URL}${API_VERSION}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Email verification failed');
    }

    return response.json();
  },

  logout() {
    localStorage.removeItem('token');
  }
};
