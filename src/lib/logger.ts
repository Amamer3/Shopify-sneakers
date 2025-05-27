// Enhanced logger service with persistence and retry tracking
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFn = (message: string, data?: unknown, retryCount?: number) => void;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  retryCount?: number;
  userId?: string;
  route?: string;
}

const MAX_LOG_HISTORY = 100;
const STORAGE_KEY = 'app_logs';
const logHistory: LogEntry[] = [];

const createLogEntry = (level: LogLevel, message: string, data?: unknown): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  data
});

const addToHistory = (entry: LogEntry) => {
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
};

const persistLogs = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logHistory));
  } catch (error) {
    console.error('Failed to persist logs:', error);
  }
};

const loadPersistedLogs = () => {
  try {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
      const parsed = JSON.parse(storedLogs);
      logHistory.push(...parsed);
      // Ensure we don't exceed max history
      while (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.shift();
      }
    }
  } catch (error) {
    console.error('Failed to load persisted logs:', error);
  }
};

const getRouteContext = () => {
  try {
    return window.location.pathname;
  } catch {
    return undefined;
  }
};

const getUserContext = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id;
    }
  } catch {
    return undefined;
  }
};

const createLogFn = (level: LogLevel): LogFn => (message: string, data?: unknown, retryCount?: number) => {
  const entry = {
    ...createLogEntry(level, message, data),
    retryCount,
    userId: getUserContext(),
    route: getRouteContext()
  };

  addToHistory(entry);
  persistLogs();

  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Sentry.captureMessage(message, { 
      //   level, 
      //   extra: { ...data, retryCount, userId: entry.userId, route: entry.route } 
      // });
      console[level](message, { data, retryCount, userId: entry.userId, route: entry.route });
    } catch (error) {
      console.error('Logging failed:', error);
    }
  } else {
    console[level](message, { data, retryCount, userId: entry.userId, route: entry.route });
  }
};

export const logger = {
  debug: createLogFn('debug'),
  info: createLogFn('info'),
  warn: createLogFn('warn'),
  error: createLogFn('error'),
  getHistory: () => [...logHistory],
  clearHistory: () => logHistory.length = 0
};

// Load persisted logs when the module is imported
loadPersistedLogs();
