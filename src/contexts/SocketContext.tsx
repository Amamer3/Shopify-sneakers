import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket.service';
import { SocketState, SocketEvents } from '../types/socket';
import { useAuth } from './AuthContext';
import { logger } from '../lib/logger';
import { getAuthToken } from '../lib/tokenUtils';

interface SocketContextType {
  state: SocketState;
  connected: boolean;
  sendEvent<T extends keyof SocketEvents>(
    event: T,
    ...args: Parameters<SocketEvents[T]>
  ): void;
  addListener<T extends keyof SocketEvents>(
    event: T,
    handler: SocketEvents[T]
  ): () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {  const [state, setState] = useState<SocketState>(socketService.getState());
  const { isAuthenticated } = useAuth();
  const token = getAuthToken();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.updateToken(token);
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Monitor socket state changes
    const handleConnect = () => setState(socketService.getState());
    const handleDisconnect = () => setState(socketService.getState());
    const handleReconnect = () => setState(socketService.getState());

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('reconnect', handleReconnect);

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value: SocketContextType = {
    state,
    connected: state.connected,
    sendEvent: (...args) => socketService.emit(...args),
    addListener: (event, handler) => {
      socketService.on(event, handler);
      // Return cleanup function
      return () => {
        // Remove handler from the map
        const handlers = socketService['eventHandlers'].get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          socketService['eventHandlers'].set(event, handlers);
        }
      };
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
