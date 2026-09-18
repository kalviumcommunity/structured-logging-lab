const { logger } = require('./logger');

const processPayment = (log = logger) => {
  log.info('payment.start');
  setTimeout(() => {
    log.info('payment.done');
  }, 500);
};

module.exports = { processPayment };
