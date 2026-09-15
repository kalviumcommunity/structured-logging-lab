const express = require('express');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const { logger, requestLoggerMiddleware } = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());
app.use(requestLoggerMiddleware);

logger.info("Starting orders-api service");

connectDb();

app.get('/', (req, res) => {
  logger.info("Orders API root endpoint checked");
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  logger.info("Payment process initiated");
  processPayment();
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  logger.error({ err: "Simulated payment processing failure" }, "Something went wrong during payment operation");
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, "Orders API server listening");
});
