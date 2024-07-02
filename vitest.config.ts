import tsPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsPaths()],
  test: {
    include: ['tests/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
    globalSetup: ['tests/global-setup.ts'],
  },
});
