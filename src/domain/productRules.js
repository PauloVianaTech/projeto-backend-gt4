function imageUrl(image) {
  const content = typeof image?.content === 'string' ? image.content.trim() : '';
  if (!/^https?:\/\//i.test(content)) {
    throw new Error('Cada imagem deve informar uma URL pública iniciada por http:// ou https://.');
  }
  return content;
}

function pagination(query) {
  const limit = Number(query.limit ?? 12);
  const page = Number(query.page ?? 1);
  if (!Number.isInteger(limit) || (limit !== -1 && (limit < 1 || limit > 100))) {
    throw new Error('limit deve ser -1 ou um inteiro entre 1 e 100.');
  }
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger((page - 1) * Math.max(limit, 1))) {
    throw new Error('page deve ser um inteiro positivo válido.');
  }
  return { limit, page };
}
module.exports = { imageUrl, pagination };
