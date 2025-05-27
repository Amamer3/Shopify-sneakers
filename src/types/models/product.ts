export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;           // Main product image
  images?: string[];       // Additional product images
  category: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  stockQuantity?: number;
  rating?: number;
  reviews?: number;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}
