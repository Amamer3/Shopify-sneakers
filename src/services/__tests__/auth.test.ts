import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createVerificationEmailTemplate } from '../emailTemplates';
import { AxiosError } from 'axios';
import { authService } from '../auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockPost = vi.fn();
vi.mock('../../lib/api', () => ({
  api: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock window.location
const originalWindow = { ...window };
vi.stubGlobal('window', {
  ...window,
  location: {
    ...window.location,
    origin: 'http://localhost:3000'
  }
});

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    // Restore window
    vi.stubGlobal('window', originalWindow);
  });
  describe('resendVerification', () => {
    it('should call the verification API endpoint', async () => {
      const email = 'test@example.com';
      const authToken = 'test-token';
      localStorage.setItem('token', authToken);
      mockPost.mockResolvedValueOnce({ data: { message: 'Verification email sent' } });

      await authService.resendVerification(email);

      expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification', {
        email,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
    });

    it('should handle rate limiting from backend', async () => {
      const email = 'test@example.com';
      const authToken = 'test-token';
      localStorage.setItem('token', authToken);
      
      const rateLimitError = new AxiosError();
      rateLimitError.response = {
        data: { error: { message: 'Too many requests. Please wait before trying again.' } },
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'retry-after': '300' // 5 minutes
        },
        config: {} as any
      };
      mockPost.mockRejectedValueOnce(rateLimitError);

      await expect(authService.resendVerification(email)).rejects.toThrow('Too many requests');
    });

    it('should handle authentication errors', async () => {
      const email = 'test@example.com';
      const authToken = 'invalid-token';
      localStorage.setItem('token', authToken);
      
      const authError = new AxiosError();
      authError.response = {
        data: { error: { message: 'Invalid or expired token' } },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      mockPost.mockRejectedValueOnce(authError);

      await expect(authService.resendVerification(email)).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('canResendVerification', () => {    it('should return true if no previous send', () => {
      expect(authService.canResendVerification()).toBe(true);
    });

    it('should return false if last send was less than 5 minutes ago', () => {
      const now = new Date(2024, 0, 1, 12, 0).getTime();
      vi.setSystemTime(now);
      localStorage.setItem('lastVerificationSent', now.toString());
      
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes
      
      expect(authService.canResendVerification()).toBe(false);
    });

    it('should return true if last send was more than 5 minutes ago', () => {
      const now = new Date(2024, 0, 1, 12, 0).getTime();
      vi.setSystemTime(now);
      localStorage.setItem('lastVerificationSent', now.toString());
      
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
      
      expect(authService.canResendVerification()).toBe(true);
    });
  });
});
