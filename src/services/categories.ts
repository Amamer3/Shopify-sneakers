import { getAuthHeaders } from './auth';
import { Product } from './products';

const API_VERSION = '/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  parentId?: string;
  subCategories?: Category[];
  productCount?: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface CategoryProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  category: Category;
}

export const categoryService = {
  async getAllCategories(params?: {
    includeSubcategories?: boolean;
    parentId?: string;
  }): Promise<CategoriesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.includeSubcategories !== undefined) {
      queryParams.append('includeSubcategories', params.includeSubcategories.toString());
    }
    if (params?.parentId) {
      queryParams.append('parentId', params.parentId);
    }

    const queryString = queryParams.toString();
    const url = `${API_VERSION}/categories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch categories' }));
      throw new Error(error.message || 'Failed to fetch categories');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${API_VERSION}/categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch category' }));
      throw new Error(error.message || 'Failed to fetch category');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  },

  async getCategoryProducts(
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<CategoryProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `${API_VERSION}/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        throw new Error('Server error: Unable to connect to the service');
      }
      
      const error = await response.json()
        .catch(() => ({ message: 'Failed to fetch category products' }));
      throw new Error(error.message || 'Failed to fetch category products');
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }

    return response.json();
  }
};
