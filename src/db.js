const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDb = async (attempts = 5) => {
  logger.info({ dbHost: process.env.DB_HOST || 'localhost' }, 'db.connect.start');

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query('SELECT NOW()');
      logger.info({ attempt }, 'db.connect.ok');
      return;
    } catch (err) {
      if (attempt === attempts) {
        logger.error({ attempt, err: err.message }, 'db.connect.failed');
        return;
      }

      logger.warn({ attempt, err: err.message }, 'db.connect.retry');
      await sleep(1000);
    }
  }
};

const queryDb = async (text, params, log = logger) => {
  const startedAt = Date.now();
  log.debug({ sql: text.split(/\s+/).slice(0, 3).join(' ') }, 'db.query.start');
  const res = await pool.query(text, params);
  log.info({ rowCount: res.rowCount, durationMs: Date.now() - startedAt }, 'db.query.ok');
  return res;
};

module.exports = { connectDb, queryDb, pool };
