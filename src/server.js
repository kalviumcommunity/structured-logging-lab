const express = require('express');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const { logger, createRequestId } = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  const reqId = createRequestId();
  req.reqId = reqId;
  next();
});

// Intentionally vague startup logging
logger.info('service starting');

connectDb();

app.get('/', (req, res) => {
  logger.info('Health check endpoint accessed', req.reqId);
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  logger.info('Payment processing initiated', req.reqId);
  processPayment();
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  logger.error('Simulated error occurred', req.reqId);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info('Server listening on port 3000');
});
