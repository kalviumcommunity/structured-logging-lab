const crypto = require("crypto")

function createRequestId(){
  return crypto.randomUUID();
}

function log(level, msg, reqId){
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: 'orders-api',
    msg,
    reqId
  }));
}

const logger = {
  info: (msg, reqId) => log('info', msg, reqId),
  warn: (msg, reqId) => log('warn', msg, reqId),
  error: (msg, reqId) => log('error', msg, reqId)
};

module.exports = {logger, createRequestId};