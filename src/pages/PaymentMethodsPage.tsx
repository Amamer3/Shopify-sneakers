
import React from 'react';
import { useAuthRequired } from '../hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, CreditCard, PlusCircle, Trash2 } from 'lucide-react';

// Mock payment methods (will come from backend in real app)
const mockPaymentMethods = [
  {
    id: 'pm-1234',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
  {
    id: 'pm-1235',
    type: 'mastercard',
    last4: '5555',
    expMonth: 8,
    expYear: 2024,
    isDefault: false,
  }
];

export function PaymentMethodsPage() {
  // Protect this route
  const { isLoading } = useAuthRequired();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Methods</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Your Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your saved payment methods
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {mockPaymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payment methods added yet</p>
                </div>
              ) : (
                mockPaymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {method.type === 'visa' ? (
                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
                        ) : method.type === 'mastercard' ? (
                          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">MC</div>
                        ) : (
                          <div className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold">CARD</div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.last4}
                          {method.isDefault && (
                            <Badge variant="outline" className="ml-2">Default</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm" className="mr-2">
                          Set default
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              
              <Button variant="outline" className="w-full" onClick={() => alert('In a real app, this would open a payment form')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Payment Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We use industry-standard encryption to protect your payment information.
                Your card details are never stored on our servers and are securely
                processed by our payment provider.
              </p>
              <Separator className="my-4" />
              <p className="text-sm">
                <strong>PCI Compliant:</strong> We follow all security standards established
                by the Payment Card Industry.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Badge component for this page since we're using it once and don't want to import
function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "outline", className?: string }) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantStyles = variant === "outline" 
    ? "border border-primary text-primary" 
    : "bg-primary text-primary-foreground";
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${className || ""}`}>
      {children}
    </span>
  );
}

export default PaymentMethodsPage;
