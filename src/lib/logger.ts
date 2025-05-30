import { toast } from 'sonner';
import { USER_STORAGE_KEY } from './tokenUtils';

// Types
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFn = (message: string, data?: unknown, retryCount?: number) => void;

interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    label?: string;
  }>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  retryCount?: number;
  userId?: string;
  route?: string;
}

// Constants
const MAX_LOG_HISTORY = 100;
const STORAGE_KEY = 'app_logs';
const MIN_LOG_LEVEL = (import.meta.env.VITE_MIN_LOG_LEVEL || 'info') as LogLevel;
const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const ENABLE_EXTERNAL_LOGGING = import.meta.env.VITE_ENABLE_EXTERNAL_LOGGING === 'true';
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// In-memory log storage
const logHistory: LogEntry[] = [];

// Utility to validate log entries
const isValidLogEntry = (entry: unknown): entry is LogEntry => {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'timestamp' in entry &&
    'level' in entry &&
    'message' in entry &&
    LOG_LEVELS.includes((entry as any).level)
  );
};

// Utility to create log entry
const createLogEntry = (level: LogLevel, message: string, data?: unknown, retryCount?: number): LogEntry => ({
  timestamp: new Date().toLocaleString('en-US', { timeZone: TIMEZONE }),
  level,
  message,
  data,
  retryCount,
  userId: getUserContext(),
  route: getRouteContext(),
});

// Add log to history
const addToHistory = (entry: LogEntry) => {
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
  persistLogs();
};

// Persist logs to localStorage
const persistLogs = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logHistory));
  } catch (error) {
    console.error('Failed to persist logs:', error);
    toast.error('Failed to save logs', { description: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Load persisted logs
const loadPersistedLogs = () => {
  try {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
      const parsed = JSON.parse(storedLogs);
      if (Array.isArray(parsed)) {
        const validLogs = parsed.filter(isValidLogEntry);
        logHistory.push(...validLogs);
        while (logHistory.length > MAX_LOG_HISTORY) {
          logHistory.shift();
        }
      }
    }
  } catch (error) {
    console.error('Failed to load persisted logs:', error);
    toast.error('Failed to load logs', { description: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get current route
const getRouteContext = () => {
  try {
    return window.location.pathname;
  } catch {
    return undefined;
  }
};

// Get user context from localStorage
const getUserContext = () => {
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      const user: User = JSON.parse(userJson);
      return user.uid;
    }
  } catch {
    return undefined;
  }
};

// Create logging function
const createLogFn = (level: LogLevel): LogFn => (message: string, data?: unknown, retryCount?: number) => {
  // Skip logging if level is below minimum
  const levelIndex = LOG_LEVELS.indexOf(level);
  const minLevelIndex = LOG_LEVELS.indexOf(MIN_LOG_LEVEL);
  if (levelIndex < minLevelIndex) return;

  const entry = createLogEntry(level, message, data, retryCount);
  addToHistory(entry);

  const logData = { data, retryCount, userId: entry.userId, route: entry.route };

  if (process.env.NODE_ENV === 'production' && ENABLE_EXTERNAL_LOGGING) {
    try {
      // Example: Sentry.captureMessage(message, {
      //   level,
      //   extra: logData,
      // });
      console[level](message, logData);
    } catch (error) {
      console.error('Logging to external service failed:', error);
    }
  } else {
    console[level](message, logData);
  }

  // Show toast for error logs
  if (level === 'error') {
    toast.error(message, { description: data ? JSON.stringify(data) : undefined });
  }
};

// Logger instance
export const logger = {
  debug: createLogFn('debug'),
  info: createLogFn('info'),
  warn: createLogFn('warn'), 
  error: createLogFn('error'),
  getHistory: () => [...logHistory],
  clearHistory: () => {
    logHistory.length = 0;
    try {
      localStorage.removeItem(STORAGE_KEY);
      logger.info('Log history cleared');
    } catch (error) {
      logger.error('Failed to clear log history', error);
    }
  },
};

// Initialize persisted logs
loadPersistedLogs();