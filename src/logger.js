const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  messageKey: 'msg',
  timestamp: () => `,"ts":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'orders-api',
  },
});

module.exports = logger;

