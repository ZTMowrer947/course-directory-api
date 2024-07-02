import 'dotenv/config';

import $ from 'dax-sh';
import mysql from 'mysql2/promise';
import type { GlobalSetupContext } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}

// Test database URL setup
const testDatabaseUrl = new URL(process.env.DATABASE_URL!);
testDatabaseUrl.pathname = '/coursedir_test';

export async function setup({ provide }: GlobalSetupContext) {
  console.log('Initializing test database...\n');

  // Create and initialize test database
  process.env.DATABASE_URL = testDatabaseUrl.toString();
  await $`pnpm prisma migrate deploy`.env(
    'DATABASE_URL',
    testDatabaseUrl.toString()
  );

  // Provide URL to test database for test usage
  provide('testDatabaseUrl', testDatabaseUrl.toString());

  console.log(
    '\nSuccessfully initialized test database, now starting tests...'
  );
}

export async function teardown() {
  console.log('\nDeleting test database...');

  const conn = await mysql.createConnection(testDatabaseUrl.toString());

  // Drop test database
  try {
    await conn.execute('DROP DATABASE coursedir_test;');
  } finally {
    await conn.end();
  }

  console.log('Test database deleted successfully.');
}
