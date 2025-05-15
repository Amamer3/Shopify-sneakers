import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { printOrder } from '@/utils/export';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        <Button variant="outline" onClick={() => printOrder(order)}>
          <Printer className="mr-2 h-4 w-4" /> Print Order
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed on {format(new Date(order.date), 'PPP')}
              </p>
            </div>
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'default'
                  : order.status === 'cancelled'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Shipping Information</h3>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.trackingNumber && (
                <p className="mt-4">
                  <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                </p>
              )}
            </div>

            {/* Payment Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Payment Information</h3>
              <p>
                {order.paymentMethod.type.charAt(0).toUpperCase() +
                  order.paymentMethod.type.slice(1)}
                {order.paymentMethod.last4 && ` ending in ${order.paymentMethod.last4}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderDetailPage;
