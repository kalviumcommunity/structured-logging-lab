const express = require('express');
const crypto = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const { logger } = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());

// Correlation ID & Structured Child Logger Middleware
// Generates a unique request ID (or respects incoming X-Request-Id header)
// and attaches req.log scoped with reqId to follow request lifecycle end-to-end
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  req.log = logger.child({ reqId });

  const startTime = Date.now();
  req.log.info({ method: req.method, path: req.path }, 'Incoming request');

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    req.log[level](
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
      },
      'Request completed'
    );
  });

  next();
});

// Structured startup logging
logger.info(
  { port, environment: process.env.NODE_ENV || 'development' },
  'Starting Orders API service'
);

connectDb();

app.get('/', (req, res) => {
  req.log.info('Health check probe received');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  const orderId = req.body && req.body.orderId ? req.body.orderId : 8841;
  req.log.info({ orderId }, 'payment.start');
  processPayment(orderId, req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error(
    {
      err: {
        name: 'PaymentGatewayTimeoutError',
        message: 'Downstream payment gateway unreachable after 3 retries',
        endpoint: '/v1/charge',
      },
    },
    'Simulated payment failure occurred'
  );
  res.status(500).send('Internal Server Error');
});

// Global error handler
app.use((err, req, res, next) => {
  const log = req.log || logger;
  log.error({ err }, 'Unhandled application error');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'Orders API service listening and ready for traffic');
});
