const { Pool } = require('pg');
const { logger } = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const connectDb = async () => {
  logger.info("Connecting to database...");
  try {
    await pool.query('SELECT NOW()');
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error({ err: err.message }, "Database connection failed");
    logger.warn("Retrying database connection...");
  }
};

const queryDb = async (text, params) => {
  logger.info({ query: text }, "Executing database query");
  const res = await pool.query(text, params);
  logger.info({ rowCount: res.rowCount }, "Database query completed");
  return res;
};

module.exports = { connectDb, queryDb, pool };
