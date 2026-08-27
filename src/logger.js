const service = process.env.SERVICE_NAME || 'orders-api';

const write = (level, context, msg) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service,
    ...context,
    msg,
  };

  process.stdout.write(`${JSON.stringify(entry)}\n`);
};

const createLogger = (context = {}) => {
  const logger = {
    debug: (fields, msg) => write('debug', { ...context, ...fields }, msg),
    info: (fields, msg) => write('info', { ...context, ...fields }, msg),
    warn: (fields, msg) => write('warn', { ...context, ...fields }, msg),
    error: (fields, msg) => write('error', { ...context, ...fields }, msg),
    child: (childContext) => createLogger({ ...context, ...childContext }),
  };

  return logger;
};

const logger = createLogger();

module.exports = { logger, createLogger };
