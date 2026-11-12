const { logger } = require('../observability');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImage = require('../models/ProductImage');
const ProductOption = require('../models/ProductOption');
const { Op, Sequelize } = require('sequelize');

const { imageUrl: getImageUrl, pagination } = require('../domain/productRules');

class ProductService {
  /**
   * Realiza uma busca complexa por produtos com base em query params.
   */
  async search(query) {
    const { fields, match, category_ids, 'price-range': priceRange } = query;
    const { limit, page } = pagination(query);
    const findOptions = { where: {}, include: [], distinct: true }; // Adicionado distinct para evitar duplicatas

    if (limit !== -1) {
        findOptions.limit = parseInt(limit);
        findOptions.offset = (parseInt(page) - 1) * parseInt(limit);
    }

    if (match) {
        findOptions.where[Op.or] = [
            { nome: { [Op.like]: `%${match}%` } },
            { description: { [Op.like]: `%${match}%` } },
        ];
    }
    
    if (category_ids) {
        findOptions.include.push({
            model: Category, as: 'categories',
            where: { id: { [Op.in]: category_ids.split(',') } },
            attributes: [], through: { attributes: [] }
        });
    }

    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        findOptions.where.price_with_discount = { [Op.between]: [min, max] };
    }
    
    // Filtra os IDs antes da paginação e preserva todas as associações na resposta.
    for (const [key, value] of Object.entries(query)) {
      if (!key.startsWith('option[')) continue;
      const matchOption = /^option\[([1-9]\d*)\]$/.exec(key);
      if (!matchOption || typeof value !== 'string' || !value.trim()) {
        throw new Error('Filtro de opção inválido.');
      }
      const optionId = Number(matchOption[1]);
      if (!Number.isSafeInteger(optionId)) throw new Error('ID da opção inválido.');
      const optionValues = value.split(',').map(item => item.trim());
      if (optionValues.some(item => !item)) throw new Error('Valor da opção inválido.');
      const options = await ProductOption.findAll({
        attributes: ['product_id'], raw: true,
        where: {
          id: optionId,
          [Op.and]: Sequelize.where(
            Sequelize.cast(Sequelize.col('valores_do_produto'), 'jsonb'),
            { [Op.contains]: Sequelize.cast(JSON.stringify(optionValues), 'jsonb') }
          ),
        },
      });
      const predicates = findOptions.where[Op.and] || [];
      predicates.push({ id: { [Op.in]: options.map(option => option.product_id) } });
      findOptions.where[Op.and] = predicates;
    }
    findOptions.include.push(
        { model: ProductImage, as: 'images', attributes: ['id', 'path'] },
        { model: ProductOption, as: 'options' },
        { model: Category, as: 'categories', attributes: ['id', 'nome'], through: { attributes: [] } }
    );

    if (fields) findOptions.attributes = fields.split(',');
    
    const { count, rows } = await Product.findAndCountAll(findOptions);

    const data = rows.map(product => {
        const plainProduct = product.get({ plain: true });
        return {
            ...plainProduct,
            category_ids: plainProduct.categories.map(cat => cat.id),
            images: plainProduct.images.map(img => ({ id: img.id, content: img.path }))
        };
    });

    return { data, total: count, limit: limit === -1 ? count : parseInt(limit), page: limit === -1 ? 1 : parseInt(page) };
  }

  /**
   * Busca um único produto por seu ID, incluindo associações.
   */
  async findById(id) {
    const product = await Product.findByPk(id, {
        include: [
            { model: ProductImage, as: 'images' },
            { model: ProductOption, as: 'options' },
            { model: Category, as: 'categories', through: { attributes: [] } }
        ]
    });

    if(!product) return null;

    const plainProduct = product.get({ plain: true });
    return {
        ...plainProduct,
        category_ids: plainProduct.categories.map(cat => cat.id),
        images: plainProduct.images.map(img => ({ id: img.id, content: img.path }))
    };
  }

  /**
   * Cria um novo produto e suas associações de forma transacional.
   */
  async create(data) {
    const { category_ids, images, options, ...productData } = data;
    const transaction = await Product.sequelize.transaction();
    try {
        const product = await Product.create(productData, { transaction });

        if (category_ids && category_ids.length > 0) {
            await product.setCategories(category_ids, { transaction });
        }
        if (images && Array.isArray(images)) {
            const imagePromises = images.map(img => ProductImage.create({
                product_id: product.id,
                path: getImageUrl(img)
            }, { transaction }));
            await Promise.all(imagePromises);
        }
        if (options && Array.isArray(options)) {
            const optionPromises = options.map(opt => {
                const valores = opt.value || opt.values;
                return ProductOption.create({
                    product_id: product.id,
                    titulo: opt.title,
                    shape: opt.shape,
                    radius: opt.radius,
                    type: opt.type,
                    valores_do_produto: valores
                }, { transaction });
            });
            await Promise.all(optionPromises);
        }
        await transaction.commit();
        return product;
    } catch (error) {
        await transaction.rollback();
        logger.warn({ errorMessage: error.message }, 'product_create_failed');
        throw error;
    }
  }

  /**
   * Atualiza um produto e suas associações de forma transacional.
   */
  async update(id, data) {
    const { category_ids, images, options, ...productData } = data;
    const transaction = await Product.sequelize.transaction();
    
    try {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
            await transaction.rollback();
            return false;
        }

        await product.update(productData, { transaction });

        if (category_ids) {
            await product.setCategories(category_ids, { transaction });
        }

        if (images && Array.isArray(images)) {
            for (const image of images) {
                if (image.id && image.deleted) {
                    await ProductImage.destroy({ where: { id: image.id, product_id: product.id }, transaction });
                } else if (image.id && image.content) {
                    await ProductImage.update(
                        { path: getImageUrl(image) },
                        { where: { id: image.id, product_id: product.id }, transaction }
                    );
                } else if (!image.id && image.content) {
                    await ProductImage.create({
                        product_id: product.id,
                        path: getImageUrl(image)
                    }, { transaction });
                }
            }
        }

        if (options && Array.isArray(options)) {
            for (const option of options) {
                if (option.id && option.deleted) {
                    await ProductOption.destroy({ where: { id: option.id, product_id: product.id }, transaction });
                } else if (option.id) {
                    // Prepara os dados de atualização, ignorando o ID para não tentar atualizar a chave primária
                    const updateData = { ...option };
                    delete updateData.id;
                    await ProductOption.update(updateData, { where: { id: option.id, product_id: product.id }, transaction });
                } else if (!option.id && option.title) {
                    await ProductOption.create({
                        product_id: product.id,
                        titulo: option.title,
                        shape: option.shape,
                        radius: option.radius,
                        type: option.type,
                        valores_do_produto: option.value || option.values
                    }, { transaction });
                }
            }
        }
        
        await transaction.commit();
        return true;

    } catch (error) {
        await transaction.rollback();
        logger.warn({ errorMessage: error.message }, 'product_update_failed');
        throw error;
    }
  }

  /**
   * Deleta um produto pelo seu ID.
   */
  async delete(id) {
    const result = await Product.destroy({ where: { id } });
    return result > 0;
  }
}

// Exportamos uma ÚNICA INSTÂNCIA da classe.
// Isso garante que todos que usarem o serviço estarão usando o mesmo objeto (padrão Singleton).
module.exports = new ProductService();