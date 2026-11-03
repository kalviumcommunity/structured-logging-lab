const { logger } = require('./logger');

const processPayment = (orderId = 8841, log = logger) => {
  log.info({ orderId }, 'Payment processing initiated');
  // Simulate some payment processing
  setTimeout(() => {
    log.info({ orderId }, 'Payment gateway transaction confirmed');
  }, 500);
};

module.exports = { processPayment };
