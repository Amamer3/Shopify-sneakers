import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineSeparator,
} from '@/components/ui/timeline';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
} from 'lucide-react';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading: authLoading } = useAuthRequired();
  const { getOrderById } = useOrders();
  const order = getOrderById(id!);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">The order you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order {order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between">
                <p className="font-medium">Total</p>
                <p className="font-medium">${order.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
                </p>
                <Timeline>
                  {order.trackingHistory.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot>{getStatusIcon(event.status)}</TimelineDot>
                        {index < order.trackingHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <p className="font-medium">{event.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1" variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'shipped' ? 'outline' :
                    order.status === 'cancelled' ? 'destructive' :
                    'secondary'
                  }>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(order.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center mt-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <p className="font-medium">
                      {order.paymentMethod.type.toUpperCase()}
                      {order.paymentMethod.last4 && ` •••• ${order.paymentMethod.last4}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
