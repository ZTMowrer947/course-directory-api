import 'dotenv/config';

import type { GlobalSetupContext } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}

export async function setup({ provide }: GlobalSetupContext) {
  // Test database URL setup
  const testDatabaseUrl = new URL(process.env.DATABASE_URL!);
  testDatabaseUrl.pathname = '/coursedir_test';

  // Provide URL to test database for test usage
  provide('testDatabaseUrl', testDatabaseUrl.toString());
}
