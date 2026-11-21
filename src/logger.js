const SERVICE = 'orders-api';

const write = (level, bindings, msg, fields = {}) => {
  const record = {
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    msg,
    ...bindings,
    ...fields,
  };

  console.log(JSON.stringify(record));
};

const createLogger = (bindings = {}) => ({
  child: (childBindings = {}) => createLogger({ ...bindings, ...childBindings }),
  info: (msg, fields) => write('info', bindings, msg, fields),
  warn: (msg, fields) => write('warn', bindings, msg, fields),
  error: (msg, fields) => write('error', bindings, msg, fields),
});

module.exports = { createLogger };
