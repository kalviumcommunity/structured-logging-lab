const express = require('express');
const crypto = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const logger = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());

logger.info({ port }, 'app.starting');

connectDb();

app.use((req, res, next) => {
  const reqId = req.get('x-request-id') || crypto.randomUUID();
  req.id = reqId;
  req.log = logger.child({ reqId });

  const startedAt = Date.now();
  req.log.info({ method: req.method, path: req.originalUrl }, 'request.start');

  res.on('finish', () => {
    req.log.info(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      'request.finish'
    );
  });

  next();
});

app.get('/', (req, res) => {
  req.log.info({ route: '/' }, 'root.ok');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  req.log.info({ route: '/payments' }, 'payment.requested');
  processPayment(req.log);
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error({ route: '/simulate-error', reason: 'simulated_failure' }, 'request.simulated_error');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'app.listen');
});
