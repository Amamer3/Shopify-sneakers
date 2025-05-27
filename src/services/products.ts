import { getAuthHeaders } from './auth';

const API_VERSION = '/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviews?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productService = {
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: string;
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `${API_VERSION}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch products' }));
      throw new Error(error.message || 'Failed to fetch products');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_VERSION}/products/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch product' }));
      throw new Error(error.message || 'Failed to fetch product');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  }
};
