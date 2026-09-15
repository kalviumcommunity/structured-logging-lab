const pino = require('pino');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

const baseLogger = pino({
  base: {
    service: 'orders-api',
  },
  timestamp: () => `,"ts":"${new Date().toISOString()}"`,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  messageKey: 'msg',
});

// Proxy logger to automatically use request-scoped child logger if available
const logger = new Proxy(baseLogger, {
  get(target, prop, receiver) {
    const store = asyncLocalStorage.getStore();
    const activeLogger = store || target;
    const value = Reflect.get(activeLogger, prop, activeLogger);
    if (typeof value === 'function') {
      return value.bind(activeLogger);
    }
    return value;
  },
});

const requestLoggerMiddleware = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  const reqLog = baseLogger.child({ reqId });

  req.id = reqId;
  req.log = reqLog;

  asyncLocalStorage.run(reqLog, () => {
    const startTime = Date.now();
    reqLog.info({ method: req.method, url: req.url }, 'Incoming request');

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      reqLog[level](
        { method: req.method, url: req.url, statusCode: res.statusCode, durationMs },
        'Request completed'
      );
    });

    next();
  });
};

module.exports = {
  logger,
  baseLogger,
  requestLoggerMiddleware,
  asyncLocalStorage,
};
