import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf((info) => {
    const level = String(info['level']);
    const message = String(info['message']);
    const ts = String(info['timestamp']);
    const stack = typeof info['stack'] === 'string' ? info['stack'] : undefined;
    const context =
      typeof info['context'] === 'string' ? info['context'] : undefined;
    const ctx = context ? `[${context}] ` : '';
    const body = stack ? `${message}\n${stack}` : message;
    return `${ts} ${level} ${ctx}${body}`;
  }),
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const isProduction = process.env.NODE_ENV === 'production';

export const winstonTransports: winston.transport[] = isProduction
  ? [
      new winston.transports.Console({ format: consoleFormat }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: fileFormat,
      }),
    ]
  : [new winston.transports.Console({ format: consoleFormat })];

export const winstonLoggerOptions: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
  transports: winstonTransports,
};
