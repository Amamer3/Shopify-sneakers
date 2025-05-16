import React, { useState } from 'react';
import { useAuthRequired } from '../hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, CreditCard, PlusCircle, Trash2, Smartphone } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentMethodForm, PaymentMethodFormData } from '../components/PaymentMethodForm';
import { useProfile } from '../contexts/ProfileContext';
import { PaymentMethodInput, PaymentMethod } from '@/types/models';

export function PaymentMethodsPage() {
  const { isLoading: authLoading } = useAuthRequired();
  const { profile, isLoading, addPaymentMethod, deletePaymentMethod, updateProfile } = useProfile();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlePaymentSubmit = async (formData: PaymentMethodFormData) => {
    try {
      // Convert form data to API format
      const isCard = ['visa', 'mastercard', 'verve'].includes(formData.type);      const paymentData: PaymentMethodInput = {
        type: isCard ? 'card' : 'bank',
        brand: formData.type,
        holderName: formData.holderName,
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expMonth ? parseInt(formData.expMonth, 10) : undefined,
        expiryYear: formData.expYear ? parseInt(formData.expYear, 10) : undefined,
        cvc: formData.cvv
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

  const paymentMethods = profile?.paymentMethods ?? [];

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method.brand) {
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
      case 'airtel-money':
        return (
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            <Smartphone className="h-3 w-3 inline mr-1" />
            AIRTEL
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
            {method.type.toUpperCase()}
          </div>
        );
    }
  };

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
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payment methods added yet</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getPaymentMethodBadge(method)}
                      </div>
                      
                      <div>
                        <p className="font-medium">
                          {method.type === 'bank' ? 
                            method.brand :
                            <>•••• {method.last4}</>
                          }
                          {method.isDefault && (
                            <Badge variant="outline" className="ml-2">Default</Badge>
                          )}
                        </p>
                        {method.expiryMonth && method.expiryYear && (
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {!method.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => updateProfile({ defaultPaymentMethodId: method.id })}
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
                  await deletePaymentMethod(deleteId);
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

      <PaymentMethodForm
        isOpen={isAddingPayment}
        onSubmit={handlePaymentSubmit}
        onCancel={() => setIsAddingPayment(false)}
      />
    </div>
  );
}

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
