import Router from '@koa/router';

import auth, { AuthState } from '../middleware/auth';
import prismaMiddleware, { PrismaState } from '../middleware/prisma';
import validateBody from '../middleware/validate-body';
import CourseSchema, { CourseInput } from '../validation/course';

const courseRouter = new Router<PrismaState & AuthState>({
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

courseRouter.post(
  '/',
  prismaMiddleware,
  auth,
  validateBody(CourseSchema),
  async (ctx) => {
    const courseData = ctx.request.body as CourseInput;

    const createdCourse = await ctx.state.prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        estimatedTime: courseData.estimatedTime,
        materialsNeeded: courseData.materialsNeeded,
        user: {
          connect: {
            id: ctx.state.user.id,
          },
        },
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

    ctx.status = 201;
    ctx.set('Location', `/api/courses/${createdCourse.id}`);

    ctx.body = createdCourse;
  }
);

export default courseRouter;
