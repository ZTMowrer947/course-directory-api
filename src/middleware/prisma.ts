import { PrismaClient } from '@prisma/client';
import { Middleware } from 'koa';

interface PrismaState {
  prisma: PrismaClient;
}

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
