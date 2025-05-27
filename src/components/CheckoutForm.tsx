import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from './ui/loading-button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Info } from 'lucide-react';

// Enhanced validation schema with better patterns
const formSchema = z.object({
  fullName: z.string()
    .min(3, "Full name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters and spaces"),
  email: z.string()
    .email("Please enter a valid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, "Please enter a valid phone number"),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters"),
  city: z.string()
    .min(2, "City must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "City should only contain letters and spaces"),
  zipCode: z.string()
    .min(5, "Zip code must be at least 5 characters")
    .regex(/^[0-9]{5}(-[0-9]{4})?$/, "Please enter a valid US zip code (e.g. 12345 or 12345-6789)"),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  onSubmit: (values: FormValues) => void;
  isProcessing: boolean;
}

export function CheckoutForm({ onSubmit, isProcessing }: CheckoutFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Shipping Information</h2>
        <Separator />
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      aria-required="true"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      {...field} 
                      aria-required="true"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(123) 456-7890" 
                    {...field} 
                    type="tel"
                    aria-required="true"
                    autoComplete="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123 Main St" 
                    {...field} 
                    aria-required="true"
                    autoComplete="street-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="New York" 
                      {...field} 
                      aria-required="true"
                      autoComplete="address-level2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="10001" 
                      {...field} 
                      aria-required="true"
                      autoComplete="postal-code"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-md flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your personal information is securely processed and never stored without encryption.
            </p>
          </div>
            <LoadingButton 
            type="submit" 
            className="w-full"
            isLoading={isProcessing}
            loadingText="Processing..."
          >
            Place Order
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
};

export default CheckoutForm;
