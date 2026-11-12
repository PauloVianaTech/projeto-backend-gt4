const database = require('../src/database');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const ProductService = require('../src/services/ProductService');
const ProductImage = require('../src/models/ProductImage');

const catalog = {
  tenis: { nome: 'Tênis', products: [['Tênis de demonstração', 'tenis-demo-portfolio', 299.9, 249.9, 'Drip Store', 'Unissex', 'Novo'], ['Tênis Runner', 'tenis-drip-runner', 379.9, 329.9, 'Nike', 'Masculino', 'Novo'], ['Tênis Street', 'tenis-drip-street', 299.9, 249.9, 'Puma', 'Unissex', 'Novo'], ['Tênis Retro', 'tenis-drip-retro', 219.9, 189.9, 'Adidas', 'Feminino', 'Usado']], image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  camisetas: { nome: 'Camisetas', products: [['Camiseta Essential', 'camiseta-drip-essential', 129.9, 99.9, 'Drip Store', 'Unissex', 'Novo'], ['Camiseta Urban', 'camiseta-drip-urban', 149.9, 119.9, 'Drip Store', 'Unissex', 'Novo'], ['Camiseta Basic', 'camiseta-drip-basic', 99.9, 79.9, 'Drip Store', 'Masculino', 'Novo'], ['Camiseta Vintage', 'camiseta-drip-vintage', 89.9, 69.9, 'Stamp', 'Feminino', 'Usado']], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80' },
  calcas: { nome: 'Calças', products: [['Calça Cargo', 'calca-drip-cargo', 249.9, 199.9, 'Drip Store', 'Unissex', 'Novo'], ['Calça Wide', 'calca-drip-wide', 279.9, 229.9, 'Drip Store', 'Feminino', 'Novo'], ['Calça Denim', 'calca-drip-denim', 199.9, 159.9, 'OQVestir', 'Unissex', 'Novo'], ['Calça Jogger', 'calca-drip-jogger', 169.9, 139.9, 'Puma', 'Masculino', 'Usado']], image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80' },
  bones: { nome: 'Bonés', products: [['Boné Classic', 'bone-drip-classic', 89.9, 69.9, 'Drip Store', 'Unissex', 'Novo'], ['Boné Sport', 'bone-drip-sport', 109.9, 89.9, 'Nike', 'Unissex', 'Novo'], ['Boné Canvas', 'bone-drip-canvas', 79.9, 59.9, 'Drip Store', 'Masculino', 'Novo'], ['Boné Vintage', 'bone-drip-vintage', 69.9, 49.9, 'MST', 'Feminino', 'Usado']], image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80' },
  headphones: { nome: 'Headphones', products: [['Headphone Wave', 'headphone-drip-wave', 349.9, 299.9, 'JBL', 'Unissex', 'Novo'], ['Headphone Bass', 'headphone-drip-bass', 459.9, 399.9, 'JBL', 'Unissex', 'Novo'], ['Headphone Studio', 'headphone-drip-studio', 319.9, 269.9, 'Sony', 'Masculino', 'Novo'], ['Headphone Mini', 'headphone-drip-mini', 179.9, 149.9, 'JBL', 'Feminino', 'Usado']], image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' },
};

const productImages = {
  'tenis-demo-portfolio': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'tenis-drip-runner': 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80',
  'tenis-drip-street': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
  'tenis-drip-retro': 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80',
  'camiseta-drip-essential': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  'camiseta-drip-urban': 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80',
  'camiseta-drip-basic': 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=900&q=80',
  'camiseta-drip-vintage': 'https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=900&q=80',
  'calca-drip-cargo': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
  'calca-drip-wide': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
  'calca-drip-denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
  'calca-drip-jogger': 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=900&q=80',
  'bone-drip-classic': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
  'bone-drip-sport': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80',
  'bone-drip-canvas': 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=900&q=80',
  'bone-drip-vintage': 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=900&q=80',
  'headphone-drip-wave': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  'headphone-drip-bass': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80',
  'headphone-drip-studio': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
  'headphone-drip-mini': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
};
(async () => {
  await database.connection.sync();
  let created = 0;
  for (const [slug, categoryData] of Object.entries(catalog)) {
    const [category] = await Category.findOrCreate({ where: { slug }, defaults: { nome: categoryData.nome, slug, use_in_menu: true } });
    for (const [nome, productSlug, preco, price_with_discount, brand, gender, condition] of categoryData.products) {
      let product = await Product.findOne({ where: { slug: productSlug } });
      const imagePath = productImages[productSlug] || categoryData.image;
      if (!product) {
        product = await ProductService.create({ enabled: true, nome, slug: productSlug, stock: 10, description: `${nome} disponível no catálogo Drip Store.`, preco, price_with_discount, brand, gender, condition, category_ids: [category.id], images: [{ content: imagePath }], options: [] });
        created += 1;
      }
      const image = await ProductImage.findOne({ where: { product_id: product.id } });
      if (image) await image.update({ path: imagePath });
      else await ProductImage.create({ product_id: product.id, path: imagePath });
    }
  }
  console.log(`Seed concluído: ${created} produto(s) criado(s).`);
  await database.connection.close();
})().catch(async (error) => { console.error(error); await database.connection.close(); process.exit(1); });