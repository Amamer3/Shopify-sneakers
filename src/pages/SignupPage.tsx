import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
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

// Define type for useAuth hook
interface AuthContextType {
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Zod schema for form validation
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const { signup, isLoading, error } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Update password requirements and strength
  useEffect(() => {
    const requirements = {
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);

    // Calculate password strength
    let score = 0;
    if (requirements.minLength) score += 20;
    if (requirements.lowercase) score += 20;
    if (requirements.uppercase) score += 20;
    if (requirements.number) score += 20;
    if (requirements.specialChar) score += 20;
    setPasswordStrength(score <= 40 ? 'Weak' : score <= 80 ? 'Medium' : 'Strong');
  }, [password]);

  // Map auth errors to user-friendly messages
  const friendlyError = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case 'This email is already registered.': // Add case for the 409 conflict message from backend
        return 'This email is already registered.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      default:
        return error; // Display the raw error message if no friendly mapping exists
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');
      
      await signup(data.email, data.password, data.firstName, data.lastName);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Account created successfully!', {
        description: `Welcome ${data.firstName}! You can now log in to your account.`
      });
      
      // Navigate after a short delay to allow the user to see the success message
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error('Failed to create account', {
        description: friendlyError(err.code) || 'Please try again.'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to create your account
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <FormControl>
                        <Input id="firstName" placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <FormControl>
                        <Input id="lastName" placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input id="email" placeholder="email@example.com" type="email" {...field} />
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
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
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
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <div className="text-sm mt-2">
                      <p className="font-semibold">Password must contain:</p>
                      <ul className="list-disc list-inside" role="list" aria-label="Password requirements">
                        <li
                          className={passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}
                          aria-checked={passwordRequirements.minLength}
                        >
                          At least 8 characters
                        </li>
                        <li
                          className={passwordRequirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}
                          aria-checked={passwordRequirements.lowercase}
                        >
                          At least one lowercase letter
                        </li>
                        <li
                          className={passwordRequirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}
                          aria-checked={passwordRequirements.uppercase}
                        >
                          At least one uppercase letter
                        </li>
                        <li
                          className={passwordRequirements.number ? 'text-green-600' : 'text-muted-foreground'}
                          aria-checked={passwordRequirements.number}
                        >
                          At least one number
                        </li>
                        <li
                          className={passwordRequirements.specialChar ? 'text-green-600' : 'text-muted-foreground'}
                          aria-checked={passwordRequirements.specialChar}
                        >
                          At least one special character (!@#$%^&amp;*(),.?&quot;:{ }|&lt;&gt;)
                        </li>
                      </ul>
                      <p className="mt-2">
                        Password Strength:{' '}
                        <span
                          className={
                            passwordStrength === 'Weak'
                              ? 'text-red-600'
                              : passwordStrength === 'Medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }
                        >
                          {passwordStrength}
                        </span>
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;