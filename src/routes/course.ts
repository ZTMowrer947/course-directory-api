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

courseRouter.get('/:id', async (ctx) => {
  const idString = ctx.params['id'];

  if (!idString || Number.isNaN(Number.parseInt(idString, 10))) {
    ctx.throw(400, 'id must be numeric');
  } else {
    const id = Number.parseInt(idString, 10);

    const prisma = new PrismaClient();

    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        estimatedTime: true,
        materialsNeeded: true,
        userId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!course) {
      ctx.throw(404, 'course not found');
    } else {
      ctx.body = course;
    }
  }
});

export default courseRouter;
