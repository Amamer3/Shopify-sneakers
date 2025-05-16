export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image: string;
}
