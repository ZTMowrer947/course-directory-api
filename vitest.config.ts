import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
    globalSetup: ['tests/global-setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve('src'),
      '~tests': resolve('tests'),
    },
  },
});
