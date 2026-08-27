const express = require('express');
const { randomUUID } = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const { logger } = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  req.id = randomUUID();
  req.log = logger.child({ reqId: req.id });
  req.log.info({ method: req.method, path: req.path }, 'request.received');
  next();
});

logger.info({}, 'service.starting');
connectDb(logger);

app.get('/', (req, res) => {
  req.log.info({}, 'healthcheck.ok');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info({}, 'payment.started');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error({}, 'request.failed');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'service.started');
});
