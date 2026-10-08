const express = require('express');
const router = express.Router();
const { queryDb } = require('../db');

router.get('/', async (req, res) => {
  req.log.info({ route: '/orders', method: req.method }, 'orders.list.start');
  try {
    const result = await queryDb('SELECT * FROM orders', [], req.log);
    req.log.info({ route: '/orders', count: result.rows.length }, 'orders.list.ok');
    res.json(result.rows);
  } catch (err) {
    req.log.error({ route: '/orders', err: err.message }, 'orders.list.failed');
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  req.log.info({ route: '/orders', method: req.method }, 'orders.create.start');
  const { product_id, quantity, customer_id } = req.body;
  
  if (!product_id || !quantity || !customer_id) {
    req.log.warn({ route: '/orders', reason: 'missing_fields' }, 'orders.create.invalid');
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id],
      req.log
    );
    req.log.info({ route: '/orders', orderId: result.rows[0].id }, 'orders.create.ok');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    req.log.error({ route: '/orders', err: err.message }, 'orders.create.failed');
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
