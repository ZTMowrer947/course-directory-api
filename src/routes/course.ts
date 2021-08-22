import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';

const courseRouter = new Router({
  prefix: '/api/courses',
});

courseRouter.get('/', async (ctx) => {
  const prisma = new PrismaClient();

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  ctx.body = courses;
});

export default courseRouter;
