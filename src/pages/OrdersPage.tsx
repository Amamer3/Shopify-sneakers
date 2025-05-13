
import React from 'react';
import { useAuthRequired } from '../hooks/use-auth-required';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Mock order data (will come from backend in real app)
const mockOrders = [
  {
    id: 'ORD-1234',
    date: '2023-05-10',
    status: 'Delivered',
    total: 329.95,
    items: 3
  },
  {
    id: 'ORD-1235',
    date: '2023-04-22',
    status: 'Processing',
    total: 149.90,
    items: 2
  },
  {
    id: 'ORD-1236',
    date: '2023-03-15',
    status: 'Delivered',
    total: 89.95,
    items: 1
  }
];

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'processing':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

export function OrdersPage() {
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
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      {mockOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link to="/">Shop Now</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableCaption>A list of your recent orders.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusColor(order.status) as "default" | "success" | "warning" | "destructive"}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.items} {order.items === 1 ? 'item' : 'items'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${order.id}`}>
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
