const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const connectDb = async () => {
  logger.info('db.connecting');

  try {
    await pool.query('SELECT NOW()');
    logger.info('db.connected');
  } catch (err) {
    logger.error('db.connection.failed');
    logger.warn('db.retry');
  }
};

const queryDb = async (text, params) => {
  logger.info('db.query.start');

  const res = await pool.query(text, params);

  logger.info('db.query.finished');

  return res;
};

module.exports = { connectDb, queryDb, pool };