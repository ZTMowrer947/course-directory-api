import { asClass, asFunction, type AwilixContainer } from 'awilix';
import { toWebHandler, type WebHandler } from 'h3';
import { beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container, type FullDeps } from '~/container.ts';
import {
  courseDetail,
  type CoursePreview,
  coursePreview,
} from '~/selects/course.ts';
import { CourseService } from '~/services/course.ts';
import { UserService } from '~/services/user.ts';
import {
  dropTestDb,
  generateTestDbUrl,
  initTestDb,
  makeTestPrismaClient,
  truncateTables,
} from '~tests/db.ts';

import { fakeCourses, fakeUserInput } from './fake.ts';
import { userWithCourses } from './selects.ts';
import { endpoint } from './utils.ts';

describe('API Integration tests, course-related routes', () => {
  let databaseUrl: string;
  let handler: WebHandler;
  let scope: AwilixContainer<FullDeps>;

  beforeAll(async () => {
    // Generate unique database URL and initalize test database
    databaseUrl = generateTestDbUrl();

    await initTestDb(databaseUrl);

    // Create DI scope for test suite
    scope = container.createScope();

    // Provide Prisma database client specific for this suite
    scope.register(
      'prisma',
      asFunction(makeTestPrismaClient)
        .inject(() => ({ url: databaseUrl }))
        .scoped()
    );

    // Register other services
    scope.register({
      userService: asClass(UserService).scoped(),
      courseService: asClass(CourseService).scoped(),
    });

    // Initialize app under test with scoped container
    const app = initApp(scope);
    handler = toWebHandler(app);

    return async () => {
      await dropTestDb(databaseUrl);
    };
  });

  describe('Non-authenticated routes', () => {
    const courseCount = 2;
    let courseIds: CoursePreview['id'][];
    const existsCases = Array.from(
      { length: 2 },
      (_, index): [number, 'exists'] => [index + 1, 'exists']
    );

    beforeAll(async () => {
      // Initialize a user and some courses
      const prisma = scope.resolve('prisma');

      const result = await prisma.user.create({
        data: await userWithCourses(fakeUserInput(), fakeCourses(courseCount)),
        select: {
          courses: {
            select: {
              id: true,
            },
          },
        },
      });

      courseIds = result.courses.map((c) => c.id);

      return async () => {
        await truncateTables(databaseUrl);
      };
    });

    test('GET /api/courses retrieves course listing', async () => {
      // Seed database with test data
      const prisma = scope.resolve('prisma');

      const expectedCourses = await prisma.course.findMany({
        select: coursePreview(),
      });

      // Query for course list
      const res = await handler(new Request(endpoint('/api/courses')));

      // Expect a successful JSON response with the correct course listing
      expect(res.ok).toBe(true);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      await expect(res.json()).resolves.toStrictEqual(expectedCourses);
    });

    test.each([
      ...existsCases,
      [courseCount + 1, 'does not exist' as const],
      [Number.MAX_SAFE_INTEGER, 'does not exist' as const],
    ] satisfies [number, 'exists' | 'does not exist'][])(
      'GET /api/courses/:id correctly responds for course #%i, which %s',
      async (courseNum, status) => {
        const id = status === 'exists' ? courseIds[courseNum - 1] : courseNum;
        const path = `/api/courses/${encodeURIComponent(id)}`;

        const res = await handler(new Request(endpoint(path)));

        // If the course should exist, fetch what the response body should match
        if (status === 'exists') {
          const prisma = scope.resolve('prisma');
          const expectedCourse = await prisma.course.findUniqueOrThrow({
            where: {
              id,
            },
            select: courseDetail(),
          });

          // Expect a successful JSON result matching the corresponding course
          expect(res.ok).toBe(true);
          expect(res.headers.get('Content-Type')).toBe('application/json');
          await expect(res.json()).resolves.toStrictEqual(expectedCourse);
        } else {
          // If course shouldn't exist, expect a 404
          expect(res.ok).toBe(false);
          expect(res.status).toBe(404);
          expect(res.headers.get('Content-Type')).toBe('application/json');
          await expect(res.json()).resolves.toHaveProperty(
            'statusMessage',
            'Course not found'
          );
        }
      }
    );
  });

  test.todo('POST /api/courses');
  test.todo('PUT /api/courses/:id');
  test.todo('DELETE /api/courses/:id');
});
