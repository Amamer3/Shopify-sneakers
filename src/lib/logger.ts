// Simple logger service that can be enhanced with external services like Sentry
type LogLevel = 'info' | 'warn' | 'error';
type LogFn = (message: string, data?: unknown) => void;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const MAX_LOG_HISTORY = 100;
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

const createLogFn = (level: LogLevel): LogFn => (message: string, data?: unknown) => {
  const entry = createLogEntry(level, message, data);
  addToHistory(entry);

  if (process.env.NODE_ENV === 'production') {
    // In production, you would send logs to a service like Sentry
    // This is where you'd integrate with external logging services
    try {
      // Example: Sentry.captureMessage(message, { level, extra: data });
      console[level](message, data);
    } catch (error) {
      console.error('Logging failed:', error);
    }
  } else {
    // In development, just use console
    console[level](message, data);
  }
};

export const logger = {
  info: createLogFn('info'),
  warn: createLogFn('warn'),
  error: createLogFn('error'),
  getHistory: () => [...logHistory],
  clearHistory: () => logHistory.length = 0
};
