const logger = require('./logger');

const processPayment = (log = logger) => {
  log.info('Payment processing started');
  setTimeout(() => {
    log.info('Payment processed successfully');
  }, 500);
};

module.exports = { processPayment };

