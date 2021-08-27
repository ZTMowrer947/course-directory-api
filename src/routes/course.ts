import Router from '@koa/router';

import prismaMiddleware, { PrismaState } from '../middleware/prisma';

const courseRouter = new Router<PrismaState>({
  prefix: '/api/courses',
});

courseRouter.get('/', prismaMiddleware, async (ctx) => {
  const courses = await ctx.state.prisma.course.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  ctx.body = courses;
});

courseRouter.get(
  '/:id',
  // Verify ID is valid
  async (ctx, next) => {
    const idString = ctx.params['id'];

    if (!idString || Number.isNaN(Number.parseInt(idString, 10))) {
      ctx.throw(400, 'id must be numeric');
    } else {
      await next();
    }
  },
  prismaMiddleware,
  async (ctx) => {
    const idString = ctx.params['id'];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = Number.parseInt(idString!, 10);

    const course = await ctx.state.prisma.course.findUnique({
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
);

export default courseRouter;
