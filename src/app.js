const { observe, registry } = require('./observability');
require('dotenv').config();
require('./database');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerDocs = require('./config/openapi');
const swaggerUi = require('swagger-ui-express');

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitos cadastros a partir deste endereço. Tente novamente mais tarde.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

class App {
  constructor() {
    this.server = express();
    this.server.set('trust proxy', 1);
    this.server.disable('x-powered-by');
    this.server.use(observe);
    this.server.get('/metrics', async (_req, res) => {
      res.set('Content-Type', registry.contentType);
      res.send(await registry.metrics());
    });
    this.middlewares();
    this.swaggerConfig();
    this.routes();
  }

  middlewares() {
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
      : process.env.NODE_ENV === 'production'
        ? []
        : ['http://localhost:5173'];

    this.server.use(helmet({ crossOriginResourcePolicy: false }));
    this.server.use(cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origem não autorizada pelo CORS.'));
      },
    }));
    this.server.use(express.json({ limit: '2mb' }));
  }

  swaggerConfig() {
    this.server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  routes() {
    this.server.get('/health', (_request, response) => {
      response.status(200).json({ status: 'ok' });
    });

    this.server.use('/v1', apiLimiter);
    this.server.use('/v1/usuario/token', loginLimiter);
    this.server.post('/v1/usuario', registrationLimiter);
    this.server.use('/v1/usuario', userRoutes);
    this.server.use('/v1/categoria', categoryRoutes);
    this.server.use('/v1/produto', productRoutes);
  }
}

module.exports = new App().server;