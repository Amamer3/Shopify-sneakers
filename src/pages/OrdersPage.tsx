import React, { useState } from 'react';
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
import { ChevronRight, Printer, Download } from 'lucide-react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderFilter } from '@/components/OrderFilter';
import { format } from 'date-fns';
import { exportToCSV, printOrder } from '@/utils/export';

// Mock order data
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
      return 'default'; // or 'secondary' if you want a different color
    case 'processing':
      return 'secondary'; // or 'outline'
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

export function OrdersPage() {
  // Protect this route
  const { isLoading: authLoading } = useAuthRequired();
  const { orders, isLoading: ordersLoading, filterOrders, sortOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedSort, setSelectedSort] = useState<{ by: 'date' | 'total' | 'status'; direction: 'asc' | 'desc' }>({
    by: 'date',
    direction: 'desc'
  });
  
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleDateRangeChange = (range: { start: Date; end: Date } | null) => {
    setSelectedDateRange(range);
  };

  const handleSortChange = (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => {
    setSelectedSort({ by, direction });
    sortOrders(by, direction);
  };

  const handleExport = () => {
    if (orders?.items) {
      exportToCSV(orders.items);
    }
  };

  const handlePrint = (orderId: string) => {
    const order = orders?.items.find(o => o.id === orderId);
    if (order) {
      printOrder(order);
    }
  };

  // Get filtered orders
  const filteredOrders = orders?.items ? filterOrders(selectedStatus, selectedDateRange) : [];
  
  if (authLoading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order History</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      
      <OrderFilter
        onStatusChange={handleStatusChange}
        onDateRangeChange={handleDateRangeChange}
        onSortChange={handleSortChange}
        selectedStatus={selectedStatus}
        selectedDateRange={selectedDateRange}
        selectedSort={selectedSort}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders found matching your filters.</p>
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusColor(order.status) as "default" | "destructive" | "outline" | "secondary"}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePrint(order.id)}>
                      <Printer className="h-4 w-4" />
                    </Button>
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
