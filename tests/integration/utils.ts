import { PrismaClient } from '@prisma/client';
import { toWebHandler } from 'h3';
import mysql from 'mysql2/promise';
import { inject } from 'vitest';

export function prismaMock() {
  return {
    prisma: new PrismaClient({
      datasources: {
        db: {
          url: inject('testDatabaseUrl'),
        },
      },
    }),
  };
}

export async function getAppHandler() {
  const { default: app } = await import('~/app.ts');

  return toWebHandler(app);
}

export function endpoint(path: string): URL {
  return new URL(path, 'http://localhost:5000');
}

export async function truncateTestDatabaseTables() {
  const queries = [
    'TRUNCATE TABLE `Course`;',
    'ALTER TABLE `Course` DROP FOREIGN KEY `course_ibfk_1`;',
    'TRUNCATE TABLE `User`;',
    'ALTER TABLE `Course` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    'ALTER TABLE `Course` AUTO_INCREMENT=1;',
    'ALTER TABLE `User` AUTO_INCREMENT=1',
  ];

  const conn = await mysql.createConnection(inject('testDatabaseUrl'));

  try {
    for (const query of queries) {
      await conn.execute(query);
    }
  } finally {
    await conn.end();
  }
}
