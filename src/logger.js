const logger = {
  info: (meta, msg) => {
    if (typeof meta === 'string') {
      msg = meta;
      meta = {};
    }
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      service: 'orders-api',
      ...meta,
      msg
    }));
  },
  warn: (meta, msg) => {
    if (typeof meta === 'string') {
      msg = meta;
      meta = {};
    }
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      service: 'orders-api',
      ...meta,
      msg
    }));
  },
  error: (meta, msg) => {
    if (typeof meta === 'string') {
      msg = meta;
      meta = {};
    }
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      service: 'orders-api',
      ...meta,
      msg
    }));
  },
  child: (childMeta) => ({
    info: (meta, msg) => logger.info({ ...childMeta, ...(typeof meta === 'object' ? meta : {}) }, typeof meta === 'string' ? meta : msg),
    warn: (meta, msg) => logger.warn({ ...childMeta, ...(typeof meta === 'object' ? meta : {}) }, typeof meta === 'string' ? meta : msg),
    error: (meta, msg) => logger.error({ ...childMeta, ...(typeof meta === 'object' ? meta : {}) }, typeof meta === 'string' ? meta : msg),
  })
};

module.exports = logger;