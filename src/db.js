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
  logger.info('database.connecting');

  try {
    await pool.query('SELECT NOW()');
    logger.info('database.connected');
  } catch (err) {
    logger.error('database.connection_failed');
    logger.warn('database.retry');
  }
};

const queryDb = async (text, params) => {
  logger.info('database.querying');

  const res = await pool.query(text, params);

  logger.info('database.query_finished');

  return res;
};

module.exports = { connectDb, queryDb, pool };