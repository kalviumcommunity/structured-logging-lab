const express = require('express');
const crypto = require('crypto');
const logger = require('./logger');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');

const app = express();
const port = 3000;

app.use(express.json());

// Attach a unique request ID and child logger to each incoming request
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.log = logger.child({ reqId: req.id });
  req.log.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

logger.info('Initializing database connection...');
connectDb();

app.get('/', (req, res) => {
  req.log.info('Health check successful');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info({ orderId: req.body?.orderId }, 'Payment started');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error({ endpoint: '/simulate-error', statusCode: 500 }, 'Simulated error occurred');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'Orders API server listening');
});

