const logger = require('./logger');

const processPayment = (log = logger) => {
  log.info({}, 'payment.start');
  // Simulate some payment processing
  setTimeout(() => {
    log.info({}, 'payment.done');
  }, 500);
};

module.exports = { processPayment };
