const express = require('express');
const crypto = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const logger = require('./logger'); // Import your structured logger

const app = express();
const port = 3000;

app.use(express.json());

// Request ID & Child Logger Middleware (Threads a unique reqId to every request)
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.log = logger.child({ reqId: req.id });
  next();
});

// Structured startup logging
logger.info({}, "starting");

connectDb();

app.get('/', (req, res) => {
  req.log.info({}, "app.root");
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info({}, "payment started");
  processPayment();
  req.log.info({}, "payment processed successfully");
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error({}, "error happened in simulate-error");
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, "server started and listening");
});