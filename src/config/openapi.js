const path = require('node:path');
const swaggerJsDoc = require('swagger-jsdoc');
module.exports = swaggerJsDoc({
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Catálogo GT4 — Projeto B', version: '1.0.0' },
    servers: [{ url: process.env.PUBLIC_API_URL || 'http://localhost:3001' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  },
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
});

const listOperation = module.exports.paths['/v1/produto/pesquisa'].get;
listOperation.responses['200'].content = {
  'application/json': {
    schema: {
      type: 'object', required: ['data', 'total', 'limit', 'page'],
      properties: {
        data: { type: 'array', items: { type: 'object', additionalProperties: true } },
        total: { type: 'integer', minimum: 0 },
        limit: { type: 'integer', minimum: 0 },
        page: { type: 'integer', minimum: 1 },
      },
    },
    example: { data: [], total: 0, limit: 12, page: 1 },
  },
};
listOperation.parameters.find(parameter => parameter.name === 'limit').schema = {
  oneOf: [{ type: 'integer', minimum: 1, maximum: 100 }, { type: 'integer', enum: [-1] }], default: 12,
};
module.exports.paths['/v1/produto'].post.requestBody.content['application/json'].schema.required = ['nome', 'slug', 'preco', 'price_with_discount'];
