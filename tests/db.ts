import { createId } from '@paralleldrive/cuid2';
import { PrismaClient } from '@prisma/client';
import $ from 'dax-sh';
import mysql from 'mysql2/promise';
import { inject } from 'vitest';

export function generateTestDbUrl(): string {
  // Get base URL for database
  const dbUrl = new URL(inject('testDatabaseUrl'));

  // Generate a database name unique to this invocation, and return it
  const dbName = `coursedir-test-${createId()}`;
  dbUrl.pathname = `/${encodeURIComponent(dbName)}`;

  return dbUrl.toString();
}

// Initalizes a Prisma client instance with the given URL
export function makeTestPrismaClient({ url }: { url: string }): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
}

export async function initTestDb(url: string) {
  // Connect to the database server and create the database
  process.env.DATABASE_URL = url;
  await $`pnpm prisma migrate deploy`.env('DATABASE_URL', url).quiet('stdout');
}

export async function dropTestDb(url: string) {
  const dbName = new URL(url).pathname.replace(/^\//, '');

  const connection = await mysql.createConnection(url);

  // Drop test database
  try {
    await connection.execute(`DROP DATABASE \`${dbName}\`;`);
  } finally {
    await connection.end();
  }
}

export async function truncateTables(url: string) {
  const queries = [
    'TRUNCATE TABLE `Course`;',
    'ALTER TABLE `Course` DROP FOREIGN KEY `course_ibfk_1`;',
    'TRUNCATE TABLE `User`;',
    'ALTER TABLE `Course` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    'ALTER TABLE `Course` AUTO_INCREMENT=1;',
    'ALTER TABLE `User` AUTO_INCREMENT=1',
  ];

  const connection = await mysql.createConnection(url);

  try {
    for (const query of queries) {
      await connection.execute(query);
    }
  } finally {
    await connection.end();
  }
}
