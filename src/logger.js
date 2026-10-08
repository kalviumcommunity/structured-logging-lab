const SERVICE = 'orders-api';

const write = (level, context, msg) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    msg,
    ...context,
  };

  process.stdout.write(`${JSON.stringify(entry)}\n`);
};

const createLogger = (context = {}) => ({
  child(extraContext = {}) {
    return createLogger({ ...context, ...extraContext });
  },
  debug(extraContext = {}, msg = 'debug') {
    write('debug', { ...context, ...extraContext }, msg);
  },
  info(extraContext = {}, msg = 'info') {
    write('info', { ...context, ...extraContext }, msg);
  },
  warn(extraContext = {}, msg = 'warn') {
    write('warn', { ...context, ...extraContext }, msg);
  },
  error(extraContext = {}, msg = 'error') {
    write('error', { ...context, ...extraContext }, msg);
  },
});

module.exports = createLogger();
