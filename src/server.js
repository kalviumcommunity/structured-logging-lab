const express = require('express');
const crypto = require('crypto');
const logger = require('./logger');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');



const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.log = logger.child({ reqId: req.id });
  next();
});


logger.info('server.starting');

connectDb();

app.get('/', (req, res) => {
  req.log.info('health.ok');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info('payment.start');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error('payment.failed');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info('server.started');
});
