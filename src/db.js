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
  logger.info({ host: pool.options.host, db: pool.options.database }, 'Connecting to database...');
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error({ err: err.message }, 'Database connection failed');
  }
};

const queryDb = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

module.exports = { connectDb, queryDb, pool };

