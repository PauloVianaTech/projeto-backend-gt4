const pino = require('pino');
const { randomUUID } = require('node:crypto');
const { Registry, Histogram } = require('prom-client');

const logger = pino({ level: process.env.NODE_ENV === 'test' ? 'silent' : 'info' });
const registry = new Registry();
const duration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das respostas HTTP em segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

function observe(req, res, next) {
  const requestId = randomUUID();
  const start = process.hrtime.bigint();
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route ? `${req.baseUrl || ''}${req.route.path}` : 'unmatched';
    if (route !== '/metrics') {
      duration.labels(req.method, route, String(res.statusCode)).observe(seconds);
    }
    logger.info({ requestId, method: req.method, route, status: res.statusCode, durationMs: seconds * 1000 }, 'http_request');
  });
  next();
}
module.exports = { logger, registry, observe };
