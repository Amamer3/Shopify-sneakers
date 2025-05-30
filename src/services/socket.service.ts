import { io, Socket } from 'socket.io-client';
import type { SocketEvents, SocketConnectionConfig, SocketState } from '../types/socket';
import { logger } from '../lib/logger';
import { getAuthToken } from '../lib/tokenUtils';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://shopify-server-ws3z.onrender.com';

class SocketService {
  private socket: Socket | null = null;
  private state: SocketState = {
    connected: false,
    lastConnected: null,
    reconnecting: false,
    reconnectAttempts: 0,
  };

  private config: SocketConnectionConfig = {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: false,
    auth: {
      token: '',
    },
  };

  private eventHandlers = new Map<keyof SocketEvents, Array<(...args: any[]) => void>>();
  constructor() {
    // Don't initialize socket in constructor
  }

  private initializeSocket() {
    const token = getAuthToken();
    if (!token) {
      logger.debug('Waiting for auth token before socket initialization');
      return;
    }

    this.config.auth.token = token;
    this.socket = io(SOCKET_URL, this.config);

    this.setupConnectionHandlers();
    this.setupReconnection();
    this.setupEventLogging();
  }

  private setupConnectionHandlers() {
    if (!this.socket) return;    this.socket.on('connect', () => {
      this.state.connected = true;
      this.state.lastConnected = Date.now();
      this.state.reconnecting = false;
      this.state.reconnectAttempts = 0;
      logger.info('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.state.connected = false;
      logger.warn('Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      logger.error('Socket connection error', error);
      this.state.connected = false;
    });
  }

  private setupReconnection() {
    if (!this.socket) return;

    this.socket.on('reconnect_attempt', (attempt: number) => {
      this.state.reconnecting = true;
      this.state.reconnectAttempts = attempt;
      logger.info(`Socket reconnection attempt ${attempt}`);
    });    this.socket.on('reconnect', () => {
      this.state.reconnecting = false;
      this.state.lastConnected = Date.now();
      logger.info('Socket reconnected');
    });

    this.socket.on('reconnect_error', (error: Error) => {
      logger.error('Socket reconnection error', error);
    });

    this.socket.on('reconnect_failed', () => {
      logger.error('Socket reconnection failed');
      this.state.reconnecting = false;
    });
  }

  private setupEventLogging() {
    if (!this.socket) return;

    this.socket.onAny((event, ...args) => {
      logger.debug(`Socket event: ${event}`, { args });
    });
  }

  public on<T extends keyof SocketEvents>(event: T, handler: SocketEvents[T]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler as any);

    if (this.socket) {
      this.socket.on(event as string, handler as (...args: any[]) => void);
    }
  }

  public off<T extends keyof SocketEvents>(event: T, handler: SocketEvents[T]): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler as any);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (this.socket) {
      this.socket.off(event as string, handler as (...args: any[]) => void);
    }
  }

  public emit<T extends keyof SocketEvents>(
    event: T,
    ...args: Parameters<SocketEvents[T]>
  ): void {
    if (!this.socket?.connected) {
      logger.warn('Attempted to emit event while socket is disconnected', { event });
      return;
    }

    this.socket.emit(event as string, ...args);
  }

  public connect(token?: string) {
    if (token) {
      this.config.auth.token = token;
    }
    
    if (!this.config.auth.token) {
      logger.warn('Cannot connect socket without auth token');
      return;
    }

    if (!this.socket) {
      this.initializeSocket();
    }

    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket?.connected) {
      logger.debug('Disconnecting socket');
      this.socket.disconnect();
      this.state.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.state.connected && !!this.socket?.connected;
  }

  public updateToken(token: string) {
    this.config.auth.token = token;
    if (this.socket?.connected) {
      this.disconnect();
      this.connect();
    }
  }

  public getState(): SocketState {
    return { ...this.state };
  }
}

export const socketService = new SocketService();
