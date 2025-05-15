import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
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
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error } = useAuth();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data.email);
      toast.success('Password reset instructions have been sent to your email');
      form.reset();
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sending Instructions...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
              
              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
