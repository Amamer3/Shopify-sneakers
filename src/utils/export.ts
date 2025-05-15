import { type Order } from "@/contexts/OrderContext";

export const exportToCSV = (orders: Order[]) => {
  const headers = ["Order ID", "Date", "Status", "Total", "Payment Method", "Customer"];
  const rows = orders.map(order => [
    order.id,
    new Date(order.date).toLocaleDateString(),
    order.status,
    order.total.toFixed(2),
    order.paymentMethod,
    order.customer.name
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

export const printOrder = (order: Order) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-details { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; }
          .items th, .items td { padding: 8px; border: 1px solid #ddd; }
          .total { text-align: right; margin-top: 20px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Urban Sole Store</h1>
          <h2>Order #${order.id}</h2>
        </div>
        <div class="order-details">
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.customer.name}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
        <table class="items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="total">
          <h3>Total: $${order.total.toFixed(2)}</h3>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  
  // Wait for images to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
