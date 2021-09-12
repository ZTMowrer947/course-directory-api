import Router, { RouterParamContext } from '@koa/router';
import { Course } from '@prisma/client';
import { Middleware } from 'koa';

import auth, { AuthState } from '../middleware/auth';
import prismaMiddleware, { PrismaState } from '../middleware/prisma';
import validateBody from '../middleware/validate-body';
import CourseSchema, { CourseInput } from '../validation/course';

// State
interface CourseState {
  course: Course;
}

type CourseRouterState = PrismaState & AuthState & CourseState;

// File-level middleware
/**
 * Verifies that the ID within the route parameters is numeric.
 * @throws 400 if the ID is invalid
 */
const validateId: Middleware<
  CourseRouterState,
  RouterParamContext<CourseRouterState>
> = async (ctx, next) => {
  const idString = ctx.params['id'];

  if (!idString || Number.isNaN(Number.parseInt(idString, 10))) {
    ctx.throw(400, 'id must be numeric');
  } else {
    await next();
  }
};

/**
 * Retrieves the data for a course given the ID within the route parameters.
 * @throws 404 if the course with said ID cannot be found
 */
const retrieveCourseById: Middleware<
  CourseRouterState,
  RouterParamContext<CourseRouterState>
> = async (ctx, next) => {
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
    ctx.state.course = course;
    await next();
  }
};

/**
 * Authorizes that the user may modify the retrieved course, in terms of updating or deleting it.
 * @throws 403 if authenticated user is not authorized to perform modifications
 */
const validateCourseToAlter: Middleware<
  CourseRouterState,
  RouterParamContext<CourseRouterState>
> = async (ctx, next) => {
  if (ctx.state.course.userId !== ctx.state.user.id) {
    ctx.throw(403, 'authenticated user not authorized to modify course');
  } else {
    await next();
  }
};

// Routes
const courseRouter = new Router<CourseRouterState>({
  prefix: '/api/courses',
});

/**
 * GET /api/courses: Retrieves a list of course titles and IDs.
 * @returns A list of course preview data
 */
courseRouter.get('/', prismaMiddleware, async (ctx) => {
  const courses = await ctx.state.prisma.course.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  ctx.body = courses;
});

/**
 * GET /api/courses/:id: Retrieves a single course by its ID.
 * @throws 404 if not found
 * @returns The course with the given ID
 */
courseRouter.get(
  '/:id',
  validateId,
  prismaMiddleware,
  retrieveCourseById,
  (ctx) => {
    ctx.body = ctx.state.course;
  }
);

/**
 * POST /api/courses: Creates a new course owned by the authenticated user.
 * @throws 401 if not authenticated, 400 if body is invalid
 * @returns 201 with the created course
 */
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

/**
 * PUT /api/courses/:id: Updates the data of an existing course in full.
 * @throws 401 if not authenticated, 403 if user does not own course, 404 if course is not found, 400 if body is invalid
 * @returns 204
 */
courseRouter.put(
  '/:id',
  validateId,
  prismaMiddleware,
  auth,
  retrieveCourseById,
  validateCourseToAlter,
  validateBody(CourseSchema),
  async (ctx) => {
    const courseData = ctx.request.body as CourseInput;

    await ctx.state.prisma.course.update({
      where: {
        id: ctx.state.course.id,
      },
      data: {
        title: courseData.title,
        description: courseData.description,
        estimatedTime: courseData.estimatedTime,
        materialsNeeded: courseData.materialsNeeded,
      },
    });

    ctx.status = 204;
  }
);

/**
 * DELETE /api/courses/:id: Deletes an existing course.
 * @throws 401 if not authenticated, 403 if user does not own course, 404 if course is not found
 * @returns 204
 */
courseRouter.delete(
  '/:id',
  validateId,
  prismaMiddleware,
  auth,
  retrieveCourseById,
  validateCourseToAlter,
  async (ctx) => {
    await ctx.state.prisma.course.delete({
      where: {
        id: ctx.state.course.id,
      },
    });

    ctx.status = 204;
  }
);

export default courseRouter;
