import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Socket events
export const EVENTS = {
  PRODUCT: {
    NEW: 'product:new',
    UPDATE: 'product:update',
    DELETE: 'product:delete',
    STOCK_UPDATE: 'product:stock',
  },
  CART: {
    UPDATE: 'cart:update',
  },
  ORDER: {
    STATUS: 'order:status',
  },
};

// Create a socket instance
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com';
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export function useSocket() {
  const socketRef = useRef<Socket>(socket);

  useEffect(() => {
    const socket = socketRef.current;

    function onConnect() {
      logger.info('Socket connected');
    }

    function onDisconnect(reason: string) {
      logger.warn('Socket disconnected:', { reason });
    }

    function onError(error: Error) {
      logger.error('Socket error:', { error });
      toast.error('Connection error', {
        description: 'Some real-time updates may be delayed'
      });
    }

    socket.connect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error', onError);
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}
