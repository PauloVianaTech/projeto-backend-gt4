const js = require('@eslint/js');
const globals = require('globals');
module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'load/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs', globals: { ...globals.node, ...globals.jest } },
    rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] },
  },
];
