const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const connectDb = async (logger) => {
  logger.info('db.connect.start');
  try {
    await pool.query('SELECT NOW()');
    logger.info('db.connect.success');
  } catch (err) {
    logger.warn('db.connect.failed', { error: err.message });
    logger.info('db.connect.retry_pending');
  }
};

const queryDb = async (text, params, logger) => {
  logger.info('db.query.start');
  const res = await pool.query(text, params);
  logger.info('db.query.success', { rowCount: res.rowCount });
  return res;
};

module.exports = { connectDb, queryDb, pool };
