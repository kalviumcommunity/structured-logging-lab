const processPayment = (logger) => {
  logger.info('payment.process');
  // Simulate some payment processing
  setTimeout(() => {
    logger.info('payment.complete');
  }, 500);
};

module.exports = { processPayment };
