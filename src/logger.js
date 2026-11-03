const crypto = require('crypto');

// Sensitive keys to automatically redact for security compliance
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'credit_card',
  'card_number',
  'cvv',
  'apikey',
  'api_key',
  'auth_token'
]);

/**
 * Deeply sanitizes an object, redacting sensitive fields and serializing Error objects.
 */
function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
      code: obj.code,
    };
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Production-ready Structured JSON Logger.
 * Emits uniform JSON entries to standard output with consistent schema:
 * ts, level, service, [bindings/reqId], [metadata], msg
 */
class StructuredLogger {
  constructor(bindings = {}) {
    this.bindings = bindings;
    this.service = bindings.service || 'orders-api';
  }

  /**
   * Creates a child logger with additional context (e.g., reqId, orderId).
   */
  child(extraBindings = {}) {
    return new StructuredLogger({
      ...this.bindings,
      ...extraBindings,
    });
  }

  _write(level, arg1, arg2) {
    const ts = new Date().toISOString();
    let msg = '';
    let metadata = {};

    if (typeof arg1 === 'string') {
      msg = arg1;
      if (typeof arg2 === 'object' && arg2 !== null) {
        metadata = sanitize(arg2);
      }
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      if (arg1 instanceof Error) {
        metadata = { err: sanitize(arg1) };
      } else {
        metadata = sanitize(arg1);
      }
      msg = typeof arg2 === 'string' ? arg2 : (metadata.msg || metadata.message || '');
      delete metadata.msg;
      delete metadata.message;
    }

    const logEntry = {
      ts,
      level,
      service: this.service,
      ...this.bindings,
      ...metadata,
      msg,
    };

    // Output strictly valid JSON to stdout for container log drivers
    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }

  info(arg1, arg2) {
    this._write('info', arg1, arg2);
  }

  warn(arg1, arg2) {
    this._write('warn', arg1, arg2);
  }

  error(arg1, arg2) {
    this._write('error', arg1, arg2);
  }

  debug(arg1, arg2) {
    this._write('debug', arg1, arg2);
  }
}

const defaultLogger = new StructuredLogger({ service: 'orders-api' });

module.exports = {
  logger: defaultLogger,
  StructuredLogger,
  sanitize,
};
