import React, { useState, useEffect, JSX } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define type for useAuth hook
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isLoading, error } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

  // Get return URL from location state or default to homepage
  const from = location.state?.from || '/';
  const isExpiredSession = location.state?.isExpired;

  // Get registration success message from location state
  const registrationMessage = location.state?.message;
  const registrationEmail = location.state?.email;

  // Show expired session message if applicable
  useEffect(() => {
    if (isExpiredSession) {
      toast.error('Your session has expired. Please log in again.');
    }
  }, [isExpiredSession]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registrationEmail || '',
      password: '',
    },
  });

  // Map auth errors to user-friendly messages
  const friendlyError = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Logging in...');
      
      await login(data.email, data.password);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Login successful!', {
        description: 'Welcome back!'
      });
      
      // Navigate after a short delay to allow the user to see the success message
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error('Login failed', {
        description: friendlyError(err.code) || 'Please check your credentials and try again.'
      });
    }
  };

  // Clear location state after showing registration message
  useEffect(() => {
    if (registrationMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [registrationMessage, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 shadow-2xl rounded-lg p-6 bg-white">
        <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">
            Please sign in to your account
          </p>
        </div>
        </div>

        {registrationMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {registrationMessage}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPassword(e.target.value);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-destructive text-sm">{friendlyError(error)}</div>
            )}

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;