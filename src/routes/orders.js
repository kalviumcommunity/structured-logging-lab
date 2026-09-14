const express = require('express');

const router = express.Router();

const { queryDb } = require('../db');

router.get('/', async (req, res) => {
  req.log.info('orders.list.start');

  try {
    const result = await queryDb(
      'SELECT * FROM orders',
      [],
      req.log
    );

    req.log.info('orders.list.success');
    res.json(result.rows);
  } catch (err) {
    req.log.error('orders.list.failed');
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  req.log.info('orders.create.start');

  const { product_id, quantity, customer_id } = req.body;

  if (!product_id || !quantity || !customer_id) {
    req.log.warn('orders.create.invalid');
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id],
      req.log
    );

    req.log.info('orders.create.success');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    req.log.error('orders.create.failed');
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
