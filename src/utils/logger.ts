/**
 * Logger Utility
 * 
 * A centralized logging system that provides consistent logging with different
 * severity levels. This allows for better control over logging output in
 * different environments.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMetadata = Record<string, unknown> | string | number | boolean | null;

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Minimum log level based on environment
const minLogLevel: LogLevel = isProduction ? 'warn' : 'debug';

/**
 * Checks if a given log level should be displayed based on environment
 */
function shouldLog(level: LogLevel): boolean {
  return logLevels[level] >= logLevels[minLogLevel];
}

/**
 * Format log message with timestamp and other metadata
 */
function formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
  const timestamp = new Date().toISOString();
  let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (metadata) {
    if (typeof metadata === 'object' && metadata !== null) {
      try {
        formatted += ` ${JSON.stringify(metadata)}`;
      } catch {
        formatted += ` [Object cannot be stringified]`;
      }
    } else {
      formatted += ` ${metadata}`;
    }
  }
  
  return formatted;
}

/**
 * Convert an Error object to a plain object for logging
 */
function errorToObject(error: Error): Record<string, unknown> {
  // First collect the standard error properties
  const errorObj: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };

  // Add any additional properties from the error
  // Get all property names, including non-enumerable ones
  Object.getOwnPropertyNames(error)
    .filter(key => !['name', 'message', 'stack'].includes(key)) // Skip standard properties already added
    .forEach(key => {
      try {
        const value = (error as unknown as Record<string, unknown>)[key];
        errorObj[key] = value;
      } catch {
        // Ignore any properties that can't be accessed
      }
    });

  return errorObj;
}

/**
 * Logger object with methods for different severity levels
 */
const logger = {
  debug: (message: string, metadata?: LogMetadata) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, metadata));
    }
  },
  
  info: (message: string, metadata?: LogMetadata) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, metadata));
    }
  },
  
  warn: (message: string, metadata?: LogMetadata) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, metadata));
    }
  },
  
  error: (message: string, error?: Error | LogMetadata) => {
    if (shouldLog('error')) {
      if (error instanceof Error) {
        console.error(formatMessage('error', message, errorToObject(error)));
        if (error.stack) {
          console.error(error.stack);
        }
      } else {
        console.error(formatMessage('error', message, error));
      }
    }
  }
};

export default logger; 