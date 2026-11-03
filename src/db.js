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
  logger.info(
    { host: process.env.DB_HOST || 'localhost', db: process.env.DB_NAME || 'ordersdb' },
    'Connecting to database...'
  );
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to database');
    logger.warn('Will retry database connection on subsequent queries');
  }
};

const queryDb = async (text, params, log = logger) => {
  log.info({ query: text }, 'Executing database query');
  const res = await pool.query(text, params);
  log.info({ rowCount: res.rowCount }, 'Database query completed');
  return res;
};

module.exports = { connectDb, queryDb, pool };
