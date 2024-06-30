import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tselint from 'typescript-eslint';

export default tselint.config(
  { ignores: ['dist/', 'node_modules', 'src/koa/'] },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  eslint.configs.recommended,
  ...tselint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': pluginImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
  configPrettier
);
