const processPayment = (log) => {
  log.info({}, 'payment.processing');
  // Simulate some payment processing
  setTimeout(() => {
    log.info({}, 'payment.completed');
  }, 500);
};

module.exports = { processPayment };
