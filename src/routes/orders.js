const express = require('express');
const router = express.Router();
const { queryDb } = require('../db');

router.get('/', async (req, res) => {
  req.log.info('Fetching all orders');
  try {
    const result = await queryDb('SELECT * FROM orders', []);
    req.log.info({ count: result.rowCount }, 'Orders fetched successfully');
    res.json(result.rows);
  } catch (err) {
    req.log.error({ err: err.message }, 'Failed to fetch orders');
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  const { product_id, quantity, customer_id } = req.body;
  req.log.info({ product_id, quantity, customer_id }, 'Creating new order');
  
  if (!product_id || !quantity || !customer_id) {
    req.log.warn({ body: req.body }, 'Order validation failed: missing required fields');
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id]
    );
    const order = result.rows[0];
    req.log.info({ orderId: order.id }, 'Order created successfully');
    res.status(201).json(order);
  } catch (err) {
    req.log.error({ err: err.message, product_id, customer_id }, 'Failed to create order');
    res.status(500).send('Error creating order');
  }
});

module.exports = router;

