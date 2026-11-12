const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const testPath = path.join(root, '.env.test');
if (fs.existsSync(envPath) || fs.existsSync(testPath)) {
  throw new Error('Configuração existente: nenhum arquivo foi alterado. Revise .env e .env.test manualmente.');
}
const password = randomBytes(24).toString('hex');
const testPassword = randomBytes(24).toString('hex');
fs.writeFileSync(envPath, `PORT=3001\nDB_PASSWORD=${password}\nJWT_SECRET=${randomBytes(32).toString('hex')}\nTEST_DB_PASSWORD=${testPassword}\nADMIN_EMAILS=admin@exemplo.com\n`, { mode: 0o600 });
fs.writeFileSync(testPath, `DB_HOST=127.0.0.1\nDB_PORT=5434\nDB_USER=catalogo_test\nDB_PASSWORD=${testPassword}\nDB_NAME=catalogo_gt4_test\nJWT_SECRET=${randomBytes(32).toString('hex')}\nJWT_EXPIRES_IN=1h\n`, { mode: 0o600 });
console.log('Configurações locais criadas com valores aleatórios; segredos não exibidos.');
