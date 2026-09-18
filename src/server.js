const express = require('express');
const pinoHttp = require('pino-http');
const crypto = require('crypto');
const { logger } = require('./logger');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
    customProps: (req) => ({ reqId: req.id }),
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

logger.info('server.start');

connectDb();

app.get('/', (req, res) => {
  req.log.info('root.ok');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info('payment.request');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error('simulate.error');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'server.listening');
});
