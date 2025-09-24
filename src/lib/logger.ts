import pino from 'pino';

// Modern structured logging with pino
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Enhanced logging methods with context
export const createLogger = (context: string) => ({
  info: (message: string, data?: object) => logger.info({ context, ...data }, message),
  error: (message: string, error?: Error | object) => logger.error({ context, error }, message),
  warn: (message: string, data?: object) => logger.warn({ context, ...data }, message),
  debug: (message: string, data?: object) => logger.debug({ context, ...data }, message),
  
  // Performance logging
  time: (label: string) => {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        logger.info({ context, duration: `${duration.toFixed(2)}ms` }, `⏱️ ${label} completed`);
      }
    };
  },
  
  // API request logging
  apiCall: (endpoint: string, method: string, data?: object) => {
    logger.info({ context, endpoint, method, ...data }, `🔗 API Call: ${method} ${endpoint}`);
  },
  
  // File processing logging
  fileProcessing: (fileName: string, fileSize: number, stage: string) => {
    logger.info({ 
      context, 
      fileName, 
      fileSize: `${(fileSize / 1024).toFixed(2)}KB`, 
      stage 
    }, `📁 File Processing: ${stage}`);
  }
});

export default logger;
