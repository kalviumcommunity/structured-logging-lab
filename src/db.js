const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const connectDb = async (log) => {
  log.info({}, 'database.connecting');
  try {
    await pool.query('SELECT NOW()');
    log.info({}, 'database.connected');
  } catch (err) {
    log.error({ error: err.message }, 'database.connection_failed');
    log.warn({}, 'database.connection_retry');
  }
};

const queryDb = async (text, params, log) => {
  log.debug({}, 'database.query.started');
  const res = await pool.query(text, params);
  log.debug({}, 'database.query.completed');
  return res;
};

module.exports = { connectDb, queryDb, pool };
