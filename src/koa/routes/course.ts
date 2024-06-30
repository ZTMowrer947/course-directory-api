import Router, { type RouterParamContext } from '@koa/router';
import type { Course, User } from '@prisma/client';
import etag from 'etag';
import type { Middleware } from 'koa';

import auth, { type AuthState } from '../middleware/auth';
import prismaMiddleware, { type PrismaState } from '../middleware/prisma';
import validateBody from '../middleware/validate-body';
import CourseSchema, { type CourseInput } from '../validation/course';

// State
type CourseWithUser = Pick<
  Course,
  | 'id'
  | 'title'
  | 'description'
  | 'estimatedTime'
  | 'materialsNeeded'
  | 'userId'
> & {
  user: Pick<User, 'firstName' | 'lastName'>;
};

interface CourseState {
  course: CourseWithUser;
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

  const id = Number.parseInt(idString, 10);

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

const ifMatchEtagCheck: Middleware<
  CourseRouterState,
  RouterParamContext<CourseRouterState>
> = async (ctx, next) => {
  // If not If-Match header is attached to this request, skip the check and continue
  if (!ctx.headers['if-match']) {
    await next();
    return;
  }

  // Get Etag from request and from course data
  const reqEtag = ctx.headers['if-match'];
  const courseEtag = etag(JSON.stringify(ctx.state.course));

  if (reqEtag !== courseEtag) {
    // ETags don't match, respond with 412 error
    ctx.throw(
      412,
      'course has been modified in another session, remove "if-match" header to force modification'
    );
  } else {
    // Etags are good, proceed
    await next();
  }
};

// Routes
const courseRouter = new Router<CourseRouterState>({
  prefix: '/api/courses',
});

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
  ifMatchEtagCheck,
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
  ifMatchEtagCheck,
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
