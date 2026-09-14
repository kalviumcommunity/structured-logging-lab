const pino = require('pino');

const logger = pino({
  base: {
    service: 'orders-api'
  },
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: () => `,"ts":"${new Date().toISOString()}"`
});

module.exports = logger;