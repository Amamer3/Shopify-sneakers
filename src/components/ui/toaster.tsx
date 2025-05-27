import React from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { X } from 'lucide-react';

// Define type for toast data
interface ToastData {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
  variant?: 'default' | 'destructive';
}

export function Toaster() {
  const { toasts } = useToast() as { toasts: ToastData[] };

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant }) => (
        <Toast key={id} variant={variant} role="alert">
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose aria-label="Close toast">
            <X className="h-4 w-4" />
          </ToastClose>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}