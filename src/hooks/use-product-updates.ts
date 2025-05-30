import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocket } from './use-socket';
import { EVENTS } from './use-socket';
import type { Product } from '@/types/models';
import { logger } from '@/lib/logger';

interface UseProductUpdatesOptions {
  onNewProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onStockUpdate?: (update: { productId: string; stockLevel: number }) => void;
  showToasts?: boolean;
}

export function useProductUpdates({
  onNewProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStockUpdate,
  showToasts = true,
}: UseProductUpdatesOptions = {}) {
  const socket = useSocket();

  const handleNewProduct = useCallback((product: Product) => {
    logger.info('New product received:', { productId: product.id });
    onNewProduct?.(product);
    
    if (showToasts) {
      toast.info('New product available!', {
        description: product.name,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/product/${product.id}`
        }
      });
    }
  }, [onNewProduct, showToasts]);

  const handleProductUpdate = useCallback((product: Product) => {
    logger.info('Product updated:', { productId: product.id });
    onUpdateProduct?.(product);
    
    if (showToasts) {
      toast.info('Product updated', {
        description: product.name,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/product/${product.id}`
        }
      });
    }
  }, [onUpdateProduct, showToasts]);

  const handleProductDelete = useCallback((productId: string) => {
    logger.info('Product deleted:', { productId });
    onDeleteProduct?.(productId);
    
    if (showToasts) {
      toast.warning('Product no longer available');
    }
  }, [onDeleteProduct, showToasts]);

  const handleStockUpdate = useCallback((update: { productId: string; stockLevel: number }) => {
    logger.info('Stock updated:', update);
    onStockUpdate?.(update);
    
    if (showToasts && update.stockLevel === 0) {
      toast.warning('Product out of stock', {
        description: 'This item is no longer available'
      });
    }
  }, [onStockUpdate, showToasts]);

  useEffect(() => {
    socket.on(EVENTS.PRODUCT.NEW, handleNewProduct);
    socket.on(EVENTS.PRODUCT.UPDATE, handleProductUpdate);
    socket.on(EVENTS.PRODUCT.DELETE, handleProductDelete);
    socket.on(EVENTS.PRODUCT.STOCK_UPDATE, handleStockUpdate);

    return () => {
      socket.off(EVENTS.PRODUCT.NEW, handleNewProduct);
      socket.off(EVENTS.PRODUCT.UPDATE, handleProductUpdate);
      socket.off(EVENTS.PRODUCT.DELETE, handleProductDelete);
      socket.off(EVENTS.PRODUCT.STOCK_UPDATE, handleStockUpdate);
    };
  }, [
    socket,
    handleNewProduct,
    handleProductUpdate,
    handleProductDelete,
    handleStockUpdate
  ]);
}
