import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, PackageCheck, Truck, Home } from 'lucide-react';

interface OrderStatus {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: Date;
  location?: string;
  description: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  total: number;
  status: OrderStatus['status'];
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  trackingNumber?: string;
  trackingHistory: OrderStatus[];
}

interface OrderTrackingProps {
  order: Order;
}

const statusIcons = {
  pending: Package,
  processing: PackageCheck,
  shipped: Truck,
  delivered: Home,
};

const statusColors = {
  pending: "text-yellow-500",
  processing: "text-blue-500",
  shipped: "text-purple-500",
  delivered: "text-green-500",
};

const badgeVariants = {
  pending: "secondary",
  processing: "default",
  shipped: "secondary",
  delivered: "default",
} as const;

export function OrderTracking({ order }: OrderTrackingProps) {
  const Icon = statusIcons[order.status];
  const statusColor = statusColors[order.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            Order #{order.orderNumber}
            <Badge variant={badgeVariants[order.status]} className="ml-2">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <span className="text-sm font-normal">
            {new Date(order.date).toLocaleDateString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium">${order.total.toFixed(2)}</p>
            </div>
            {order.trackingNumber && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <ScrollArea className="h-[200px] pr-4">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

              {/* Status Updates */}
              <div className="space-y-4">
                {order.trackingHistory.map((status, index) => (
                  <div key={index} className="relative flex items-start gap-4 pl-8">
                    <div className={`absolute left-0 p-1 rounded-full bg-background border-2 ${
                      index === 0 ? statusColor : 'border-muted'
                    }`}>
                      <div className="h-2 w-2" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {status.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {status.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(status.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Items Preview */}
          <div>
            <p className="text-sm font-medium mb-2">Items in this order:</p>
            <div className="grid grid-cols-2 gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
