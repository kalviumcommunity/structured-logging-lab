const { logger } = require('./logger');

const processPayment = () => {
  logger.info("payment.start");
  // Simulate some payment processing
  setTimeout(() => {
    logger.info("payment.complete");
  }, 500);
};

module.exports = { processPayment };
