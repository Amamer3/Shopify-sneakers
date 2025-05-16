import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          useToast().toast({
            title: 'Access Denied',
            description: 'You do not have permission to perform this action.',
            variant: 'destructive',
          });
          break;
        case 404:
          // Not Found
          useToast().toast({
            title: 'Not Found',
            description: 'The requested resource was not found.',
            variant: 'destructive',
          });
          break;
        case 422:
          // Validation Error
          useToast().toast({
            title: 'Validation Error',
            description: error.response.data.message || 'Please check your input.',
            variant: 'destructive',
          });
          break;
        case 500:
          // Server Error
          useToast().toast({
            title: 'Server Error',
            description: 'An unexpected error occurred. Please try again later.',
            variant: 'destructive',
          });
          break;
        default:
          useToast().toast({
            title: 'Error',
            description: error.response.data.message || 'An error occurred.',
            variant: 'destructive',
          });
      }
    } else if (error.request) {
      // Network Error
      useToast().toast({
        title: 'Network Error',
        description: 'Please check your internet connection.',
        variant: 'destructive',
      });
    }
    return Promise.reject(error);
  }
);
