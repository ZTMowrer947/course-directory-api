import { PrismaClient } from '@prisma/client';
import { Middleware } from 'koa';

interface PrismaState {
  /**
   * The loaded Prisma database client instance.
   */
  prisma: PrismaClient;
}

/**
 * Establishes a connection to the database through Prisma
 * and cleans up the connection after the response has been completed.
 */
const prismaMiddleware: Middleware<PrismaState> = async (ctx, next) => {
  const prisma = new PrismaClient();
  ctx.state.prisma = prisma;

  try {
    await next();
  } finally {
    await prisma.$disconnect();
  }
};

export default prismaMiddleware;
export type { PrismaState };
