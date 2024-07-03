import { PrismaClient } from '@prisma/client';
import { toWebHandler } from 'h3';
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
