import React, { useState } from 'react';
import { useAuthRequired } from '../hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, CreditCard, PlusCircle, Trash2, Smartphone } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentMethodForm } from '@/components/PaymentMethodForm';
import { usePayment } from '@/contexts/PaymentContext';

// Example payment methods for testing
const initialPaymentMethods = [
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
  const { isLoading: authLoading } = useAuthRequired();
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod, isLoading } = usePayment();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlePaymentSubmit = async (data: any) => {
    try {
      // Format card number to get last4
      const last4 = data.cardNumber ? data.cardNumber.slice(-4) : '';
      
      // Prepare payment method data based on type
      const isMobilePayment = ['mpesa', 'airtel-money', 'mtn-momo', 'orange-money', 'tigo-pesa', 'vodafone-cash', 'wave'].includes(data.type);
      
      const paymentData = {
        type: data.type,
        holderName: data.holderName,
        last4: isMobilePayment ? '' : last4,
        expMonth: isMobilePayment ? undefined : parseInt(data.expMonth),
        expYear: isMobilePayment ? undefined : parseInt(data.expYear),
        isDefault: paymentMethods.length === 0, // Make first payment method default
      };

      await addPaymentMethod(paymentData);
      setIsAddingPayment(false);
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };
  
  if (authLoading || isLoading) {
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
            
            <CardContent className="space-y-4">              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payment methods added yet</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="mr-3">                        {(() => {
                          switch (method.type) {
                            case 'visa':
                              return <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>;
                            case 'mastercard':
                              return <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">MC</div>;
                            case 'verve':
                              return <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">VERVE</div>;
                            case 'mpesa':
                              return (
                                <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  M-PESA
                                </div>
                              );
                            case 'mtn-momo':
                              return (
                                <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  MTN
                                </div>
                              );
                            case 'orange-money':
                              return (
                                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  ORANGE
                                </div>
                              );
                            case 'airtel-money':
                              return (
                                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  AIRTEL
                                </div>
                              );
                            case 'tigo-pesa':
                              return (
                                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  TIGO
                                </div>
                              );
                            case 'vodafone-cash':
                              return (
                                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  VODAFONE
                                </div>
                              );
                            case 'wave':
                              return (
                                <div className="bg-blue-400 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  WAVE
                                </div>
                              );
                            default:
                              return (
                                <div className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  <Smartphone className="h-3 w-3 inline mr-1" />
                                  MOBILE
                                </div>
                              );
                          }
                        })()}
                      </div>
                      
                      <div>
                        <p className="font-medium">
                          {method.type === 'mpesa' || method.type === 'airtel-money' ? 
                            method.holderName :
                            <>•••• •••• •••• {method.last4}</>
                          }
                          {method.isDefault && (
                            <Badge variant="outline" className="ml-2">Default</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'mpesa' || method.type === 'airtel-money' ? 
                            'Mobile Money' :
                            `Expires ${method.expMonth}/${method.expYear}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {!method.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                        >
                          Set default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => setDeleteId(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              
              <Button variant="outline" className="w-full" onClick={() => setIsAddingPayment(true)}>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  await removePaymentMethod(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Method Form Dialog */}
      <PaymentMethodForm
        isOpen={isAddingPayment}
        onSubmit={handlePaymentSubmit}
        onCancel={() => setIsAddingPayment(false)}
      />
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
