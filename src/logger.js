const pino = require('pino');

const logger = pino({
  timestamp: () => `,"ts":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({ service: 'orders-api' }),
  },
  messageKey: 'msg',
});

module.exports = { logger };
