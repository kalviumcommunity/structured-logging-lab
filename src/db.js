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
  logger.info('db.connect.start');
  try {
    await pool.query('SELECT NOW()');
    logger.info('db.connect.ok');
  } catch (err) {
    logger.error({ err: err.message }, 'db.connect.failed');
  }
};

const queryDb = async (text, params, log = logger) => {
  log.info({ query: text }, 'db.query.start');
  try {
    const res = await pool.query(text, params);
    log.info('db.query.ok');
    return res;
  } catch (err) {
    log.error({ err: err.message, query: text }, 'db.query.failed');
    throw err;
  }
};

module.exports = { connectDb, queryDb, pool };
