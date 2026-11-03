const express = require('express');
const router = express.Router();
const { queryDb } = require('../db');
const { logger } = require('../logger');

router.get('/', async (req, res) => {
  const log = req.log || logger;
  log.info('Fetching orders list');
  try {
    const result = await queryDb('SELECT * FROM orders', [], log);
    log.info({ count: result.rows.length }, 'Orders fetched successfully');
    res.json(result.rows);
  } catch (err) {
    log.error({ err }, 'Error fetching orders from database');
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  const log = req.log || logger;
  log.info('Processing new order creation request');
  const { product_id, quantity, customer_id } = req.body;

  if (!product_id || !quantity || !customer_id) {
    log.warn(
      { missing: { product_id: !product_id, quantity: !quantity, customer_id: !customer_id } },
      'Order creation validation failed: missing required fields'
    );
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id],
      log
    );
    log.info({ orderId: result.rows[0].id }, 'Order created successfully');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    log.error({ err }, 'Error creating order in database');
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
