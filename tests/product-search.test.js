const request = require('supertest');
const app = require('../src/app');
const database = require('../src/database');
const ProductService = require('../src/services/ProductService');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
let product;
let optionId;
let category;

beforeAll(async () => {
  await database.connection.sync({ force: true });
  category = await Category.create({ nome: 'Esportes', slug: 'esportes' });
  product = await ProductService.create({
    nome: 'Tênis', slug: 'tenis-filtro', preco: 100, price_with_discount: 80,
    category_ids: [category.id],
    images: [{ content: 'https://example.com/tenis.jpg' }],
    options: [{ title: 'Cor', type: 'cor', values: ['azul', 'preto'] }],
  });
  await ProductService.create({ nome: 'Camiseta', slug: 'camiseta-filtro', preco: 50, price_with_discount: 40 });
  optionId = (await ProductService.findById(product.id)).options[0].id;
});
afterAll(async () => database.connection.close());

test('filtra valores JSON no PostgreSQL e mantém categorias e imagens', async () => {
  const response = await request(app).get('/v1/produto/pesquisa')
    .query({ [`option[${optionId}]`]: 'azul,preto', limit: 1 });
  expect(response.status).toBe(200);
  expect(response.body.total).toBe(1);
  expect(response.body.data[0].id).toBe(product.id);
  expect(response.body.data[0].category_ids).toContain(category.id);
  expect(response.body.data[0].images[0].content).toBe('https://example.com/tenis.jpg');
});
test('valor de opção inexistente retorna lista vazia', async () => {
  const response = await request(app).get('/v1/produto/pesquisa').query({ [`option[${optionId}]`]: 'verde' });
  expect(response.status).toBe(200);
  expect(response.body.total).toBe(0);
  expect(response.body.data).toEqual([]);
});
test('filtros de categoria e preço retornam apenas o produto esperado', async () => {
  const response = await request(app).get('/v1/produto/pesquisa').query({ category_ids: String(category.id), 'price-range': '70-90' });
  expect(response.status).toBe(200);
  expect(response.body.data.map(item => item.id)).toEqual([product.id]);
});
test.each([{ 'option[abc]': 'azul' }, { limit: '0' }, { page: '-1' }])('filtro inválido retorna 400: %p', async query => {
  const response = await request(app).get('/v1/produto/pesquisa').query(query);
  expect(response.status).toBe(400);
});
test('imagem inválida desfaz também a criação do produto', async () => {
  await expect(ProductService.create({ nome: 'Inválido', slug: 'rollback', preco: 100, price_with_discount: 90,
    images: [{ content: 'file:///privado' }] })).rejects.toThrow('URL pública');
  expect(await Product.findOne({ where: { slug: 'rollback' } })).toBeNull();
});
