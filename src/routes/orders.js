const express = require('express');
const router = express.Router();
const { queryDb } = require('../db');
const { logger } = require('../logger');

router.get('/', async (req, res) => {
  logger.info("Fetching all orders");
  try {
    const result = await queryDb('SELECT * FROM orders', []);
    logger.info({ orderCount: result.rows.length }, "Orders fetched successfully");
    res.json(result.rows);
  } catch (err) {
    logger.error({ err: err.message }, "Error fetching orders");
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  logger.info("Creating new order");
  const { product_id, quantity, customer_id } = req.body;
  
  if (!product_id || !quantity || !customer_id) {
    logger.warn("Order creation failed validation: missing required fields");
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id]
    );
    const newOrder = result.rows[0];
    logger.info({ orderId: newOrder ? newOrder.id : null }, "Order created successfully");
    res.status(201).json(newOrder);
  } catch (err) {
    logger.error({ err: err.message }, "Error creating order");
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
