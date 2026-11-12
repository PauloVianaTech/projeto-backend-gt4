const fs = require('node:fs');
const path = require('node:path');
const spec = require('../src/config/openapi');
if (!spec.paths['/v1/produto/pesquisa']) throw new Error('Endpoint principal ausente da documentação.');
// JSON é uma representação válida de YAML 1.2, sem dependência adicional de serialização.
fs.writeFileSync(path.join(__dirname, '../docs/openapi.yaml'), JSON.stringify(spec, null, 2) + '\n');
console.log('OpenAPI exportada para docs/openapi.yaml');
