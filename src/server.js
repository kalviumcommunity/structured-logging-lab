const express = require('express');
const crypto = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const { createLogger } = require('./logger');

const app = express();
const port = 3000;
const logger = createLogger();

app.use(express.json());

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.log = logger.child({ reqId: req.id });
  const startedAt = Date.now();
  req.log.info('request.start', { method: req.method, path: req.path });

  res.on('finish', () => {
    req.log.info('request.complete', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

logger.info('service.start');

connectDb(logger);

app.get('/', (req, res) => {
  req.log.info('health.check');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info('payment.start');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  const error = new Error('simulated payment dependency failure');
  req.log.error('payment.failed', { error: error.message });
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info('service.ready', { port });
});
