import { beforeEach } from 'node:test';

import { createId } from '@paralleldrive/cuid2';
import { PrismaClient } from '@prisma/client';
import $ from 'dax-sh';
import mysql from 'mysql2/promise';
import { beforeAll, inject, vi } from 'vitest';

interface IntegrationContext {
  databaseUrl: string;
  clearTables(): Promise<void>;
}

export default function setupTestDatabase() {
  // Get base URL for datbase
  const testDatabaseUrl = new URL(inject('testDatabaseUrl'));

  // Generate a database name unique to each test file, and each run
  const dbName = `coursedir-test-${createId()}`;
  testDatabaseUrl.pathname = `/${encodeURIComponent(dbName)}`;

  beforeAll(async () => {
    // Connect to the database server and create the database
    process.env.DATABASE_URL = testDatabaseUrl.toString();
    await $`pnpm prisma migrate deploy`
      .env('DATABASE_URL', testDatabaseUrl.toString())
      .quiet('stdout');

    return async () => {
      const conn = await mysql.createConnection(testDatabaseUrl.toString());

      // Drop test database
      try {
        await conn.execute(`DROP DATABASE \`${dbName}\`;`);
      } finally {
        await conn.end();
      }
    };
  });

  beforeEach(async () => {
    // Point prisma to correct database by mocking, clear mock after test
    vi.doMock(`~/prisma-client.ts`, () => {
      return {
        prisma: new PrismaClient({
          datasources: {
            db: {
              url: testDatabaseUrl.toString(),
            },
          },
        }),
      };
    });

    return () => {
      vi.doUnmock(`~/prisma-client.ts`);
    };
  });

  async function clearTables() {
    // Truncate tables, recreate FK's, reset sequencing
    const queries = [
      'TRUNCATE TABLE `Course`;',
      'ALTER TABLE `Course` DROP FOREIGN KEY `course_ibfk_1`;',
      'TRUNCATE TABLE `User`;',
      'ALTER TABLE `Course` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
      'ALTER TABLE `Course` AUTO_INCREMENT=1;',
      'ALTER TABLE `User` AUTO_INCREMENT=1',
    ];

    const conn = await mysql.createConnection(testDatabaseUrl.toString());

    try {
      for (const query of queries) {
        await conn.execute(query);
      }
    } finally {
      await conn.end();
    }
  }

  return {
    databaseUrl: testDatabaseUrl.toString(),
    clearTables,
  } satisfies IntegrationContext;
}
