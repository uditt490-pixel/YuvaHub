import pino from "pino";

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export const logger = {
  info: (msg: any, ...args: any[]) => (typeof msg === 'string' ? pinoLogger.info(args.length ? { extra: args } : {}, msg) : pinoLogger.info(msg, ...args)),
  warn: (msg: any, ...args: any[]) => (typeof msg === 'string' ? pinoLogger.warn(args.length ? { extra: args } : {}, msg) : pinoLogger.warn(msg, ...args)),
  error: (msg: any, ...args: any[]) => (typeof msg === 'string' ? pinoLogger.error(args.length ? { extra: args } : {}, msg) : pinoLogger.error(msg, ...args)),
  debug: (msg: any, ...args: any[]) => (typeof msg === 'string' ? pinoLogger.debug(args.length ? { extra: args } : {}, msg) : pinoLogger.debug(msg, ...args)),
};
