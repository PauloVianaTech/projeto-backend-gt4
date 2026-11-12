const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const configPath = path.join(__dirname, '../.env.demo');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, `DEMO_PASSWORD=Aa1!${randomBytes(24).toString('hex')}\n`, { mode: 0o600 });
}
const { DEMO_PASSWORD } = dotenv.parse(fs.readFileSync(configPath));
const base = process.env.BASE_URL || 'http://127.0.0.1:3001';
const email = (process.env.ADMIN_EMAILS || 'admin@exemplo.com').split(',')[0].trim();
const evidence = { timestamp: new Date().toISOString(), base, steps: [] };
let token;
async function call(method, route, body, expected) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  assert.equal(response.status, expected, `${method} ${route}: status ${response.status}`);
  evidence.steps.push({ method, route, status: response.status });
  return data;
}
(async () => {
  const users = await fetch(`${base}/v1/usuario`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname: 'Paulo', surname: 'Demo GT4', email, password: DEMO_PASSWORD, confirmPassword: DEMO_PASSWORD }),
  });
  const userBody = await users.text();
  assert.ok(users.status === 201 || (users.status === 400 && JSON.parse(userBody).error === 'Este email já está em uso.'), 'Falha no cadastro de demonstração');
  evidence.steps.push({ method: 'POST', route: '/v1/usuario', status: users.status, existingAccount: users.status === 400 });
  const login = await call('POST', '/v1/usuario/token', { email, password: DEMO_PASSWORD }, 200);
  token = login.token;
  assert.equal(typeof token, 'string');
  const categories = await call('GET', '/v1/categoria/pesquisa?limit=-1', null, 200);
  if (!categories.data.some(category => category.slug === 'demo-gt4')) {
    await call('POST', '/v1/categoria', { nome: 'Demonstração GT4', slug: 'demo-gt4' }, 201);
  }
  const updatedCategories = await call('GET', '/v1/categoria/pesquisa?limit=-1', null, 200);
  const category = updatedCategories.data.find(item => item.slug === 'demo-gt4');
  let products = await call('GET', '/v1/produto/pesquisa?match=demo-gt4', null, 200);
  if (!products.data.length) {
    await call('POST', '/v1/produto', {
      nome: 'Produto demo-gt4', slug: 'demo-gt4', preco: 100, price_with_discount: 90,
      stock: 10, category_ids: [category.id],
      options: [{ title: 'Cor', type: 'cor', values: ['azul', 'preto'] }],
    }, 201);
    products = await call('GET', '/v1/produto/pesquisa?match=demo-gt4', null, 200);
  }
  const product = products.data.find(item => item.slug === 'demo-gt4');
  assert.ok(product, 'Produto demonstrativo ausente');
  await call('PUT', `/v1/produto/${product.id}`, { stock: 12 }, 204);
  const updated = await call('GET', `/v1/produto/${product.id}`, null, 200);
  assert.equal(updated.stock, 12);
  assert.ok(updated.category_ids.includes(category.id));
  const filtered = await call('GET', `/v1/produto/pesquisa?option%5B${updated.options[0].id}%5D=azul`, null, 200);
  assert.ok(filtered.data.some(item => item.id === product.id));
  evidence.result = 'passed';
  fs.writeFileSync(path.join(__dirname, '../docs/validacao-fluxo.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('Fluxo validado: cadastro, login, categoria, produto, atualização, consulta e filtro JSONB. Nenhuma senha ou token foi exibido.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
