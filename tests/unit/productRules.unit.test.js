const { imageUrl, pagination } = require('../../src/domain/productRules');

describe('Regras do catálogo', () => {
  test.each(['https://example.com/a.jpg', 'http://example.com/a.jpg'])(
    'aceita imagem HTTP: %s', url => expect(imageUrl({ content: ` ${url} ` })).toBe(url)
  );
  test.each([undefined, null, {}, { content: 12 }, { content: 'file:///a' }, { content: '' }])(
    'recusa imagem inválida: %p', image => expect(() => imageUrl(image)).toThrow('URL pública')
  );
  test('usa paginação padrão', () => expect(pagination({})).toEqual({ limit: 12, page: 1 }));
  test('converte parâmetros HTTP', () => expect(pagination({ limit: '20', page: '2' })).toEqual({ limit: 20, page: 2 }));
  test('aceita busca sem limite herdada', () => expect(pagination({ limit: '-1' }).limit).toBe(-1));
  test.each(['0', '-2', '101', 'abc', '2.5', ''])('recusa limite inválido %s', limit => {
    expect(() => pagination({ limit })).toThrow('limit');
  });
  test.each(['0', '-1', 'abc', '1.5', '9007199254740992', '9007199254740991'])('recusa página inválida %s', page => {
    expect(() => pagination({ page })).toThrow('page');
  });
});
