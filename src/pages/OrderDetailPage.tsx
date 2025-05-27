import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Printer, Bell, BellOff, RefreshCw, Package, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { printOrder } from '../utils/export';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import type { ExtendedOrder } from '../types/api';
import type { Order } from '../types/models';

const orderStatusSteps = {
  'pending': 0,
  'processing': 25,
  'shipped': 50,
  'out-for-delivery': 75,
  'delivered': 100,
  'cancelled': -1
};

const orderStatusIcons = {
  'pending': Package,
  'processing': RefreshCw,
  'shipped': Truck,
  'out-for-delivery': Truck,
  'delivered': Package,
  'cancelled': BellOff
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, trackOrder } = useOrders();
  const order = id ? getOrderById(id) : undefined;

  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true });
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const handlePrint = () => {
    // Convert ExtendedOrder to Order type for printing
    const printableOrder: Order = {
      ...order,
      shippingAddress: {
        ...order.shippingAddress,
        street: order.shippingAddress.line1,
        zipCode: order.shippingAddress.postalCode,
      }
    };
    printOrder(printableOrder);
  };
  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'secondary';
      case 'shipped':
      case 'out-for-delivery':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const StatusIcon = orderStatusIcons[order.status] || Package;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Order
          </Button>
          <Button onClick={() => trackOrder(order.id)}>
            <Bell className="mr-2 h-4 w-4" />
            Track Order
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              Order #{order.orderNumber}
              <span className="text-sm text-muted-foreground ml-2">
                {format(new Date(order.date), 'PPP')}
              </span>
            </div>
            <Badge variant={getStatusColor(order.status)}>
              <StatusIcon className="mr-2 h-4 w-4" />
              {order.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={orderStatusSteps[order.status]} className="mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Order Placed</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p>{order.paymentMethod.type}</p>
              <p>•••• {order.paymentMethod.last4}</p>
              <p>Expires {order.paymentMethod.expiryMonth}/{order.paymentMethod.expiryYear}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                  {item.size && <p className="text-sm">Size: {item.size}</p>}
                  {item.color && <p className="text-sm">Color: {item.color}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
