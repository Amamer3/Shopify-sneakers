import React, { useState, useEffect } from 'react';
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
import { handleApiError } from '../lib/tokenUtils';
import { logger } from '../lib/logger';

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Password strength calculation
const calculatePasswordStrength = (password: string): 'Weak' | 'Medium' | 'Strong' => {
  if (password.length < 8) return 'Weak';
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
  if (strengthScore >= 3) return 'Strong';
  if (strengthScore >= 2) return 'Medium';
  return 'Weak';
};

export function LoginPage() {
  const { login, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  
  // Get return URL from location state or default to home
  const from = (typeof location.state?.from === 'string' && location.state.from !== '/login' 
    ? location.state.from 
    : '/'
  ) || '/';

  // Get registration success message from location state
  const registrationMessage = location.state?.message;
  const registrationEmail = location.state?.email;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registrationEmail || '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const loadingToast = toast.loading('Logging in...');
    form.clearErrors();
    
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('Login successful!', {
          description: 'Welcome back!'
        });
        navigate(from, { replace: true });
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Failed to log in');
      logger.error('Login error:', { 
        error: err, 
        email: data.email, 
        route: '/login',
        context: 'LoginPage.onSubmit'
      });
      
      toast.dismiss(loadingToast);
      
      // Map specific error codes to form fields
      if (err instanceof Error && 'code' in err) {
        switch (err.code) {
          case 'INVALID_CREDENTIALS':
            form.setError('password', {
              message: 'Invalid email or password'
            });
            break;
          case 'INVALID_EMAIL':
            form.setError('email', {
              message: 'Please enter a valid email address'
            });
            break;
          case 'RATE_LIMIT':
            toast.error('Too many attempts', {
              description: 'Please wait a moment before trying again'
            });
            break;
          case 'NETWORK_ERROR':
            toast.error('Connection error', {
              description: 'Please check your internet connection and try again'
            });
            break;
          default:
            toast.error('Login failed', {
              description: errorMessage
            });
        }
      } else {
        toast.error('Login failed', {
          description: errorMessage
        });
      }
      
      // Focus the first field with an error
      const firstError = Object.keys(form.formState.errors)[0] as keyof LoginFormValues;
      if (firstError) {
        form.setFocus(firstError);
      }
    }
  };

  useEffect(() => {
    if (registrationMessage) {
      toast.success('Registration successful!', {
        description: registrationMessage
      });
    }
  }, [registrationMessage]);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        {/* <div className="absolute inset-0 bg-primary" /> */}
        <img className="absolute inset-0" src="/images/3d-render-login.jpg" alt="Loginimg" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Urban Sole Store
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in
            </p>
          </div>

          {registrationMessage && (
            <Alert>
              <AlertDescription>{registrationMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
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
                          placeholder="Enter your password"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordStrength(calculatePasswordStrength(e.target.value));
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">
                      Password strength: {passwordStrength}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          <div className="flex flex-col space-y-2 text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;