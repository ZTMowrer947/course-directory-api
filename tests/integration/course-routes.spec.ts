import { faker } from '@faker-js/faker';
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
import { userFromInput, userWithCourses } from './selects.ts';
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

  describe('Authenticated routes', () => {
    const courseCount = 1;
    const userInputs = Array.from({ length: 2 }, () => fakeUserInput());
    const [courseInput] = fakeCourses(courseCount);
    const courseIds = Array.from({ length: courseCount + 1 }, () => 999);

    beforeAll(async () => {
      const prisma = scope.resolve('prisma');

      const result = await prisma.user.create({
        data: await userWithCourses(userInputs[0], [courseInput]),
        select: {
          courses: {
            select: {
              id: true,
            },
          },
        },
      });

      // Create a second user to test 403's
      await prisma.user.create({
        data: await userFromInput(userInputs[1]),
      });

      const mappedIds = result.courses.map((c) => c.id);

      courseIds.splice(0, result.courses.length, ...mappedIds);

      return async () => {
        await truncateTables(databaseUrl);
      };
    });

    test.each([
      ['Absent credentials', null],
      ['Empty credentials', ['', '']],
      [
        'Nonexistent credentials',
        [faker.internet.email(), faker.internet.password()],
      ],
      [
        'Credentials with wrong password',
        [userInputs[0].emailAddress, faker.internet.password()],
      ],
    ] satisfies [string, null | [string, string]][])(
      '%s yield 401 for POST, PUT, and DELETE',
      async (_, credentials) => {
        // Get URLs for POST, PUT, and DELETE
        const postUrl = endpoint('/api/courses');
        const putDelUrl = endpoint(
          `/api/courses/${encodeURIComponent(courseIds[0])}`
        );

        // Generate shared request options from credentials
        const encodedCredentials = credentials
          ? Buffer.from(credentials.join(':')).toString('base64')
          : undefined;
        const reqOptions = {
          headers: encodedCredentials
            ? {
                Authorization: `Basic ${encodedCredentials}`,
              }
            : undefined,
        } satisfies RequestInit;

        // Make the requests
        const responses = await Promise.all([
          handler(
            new Request(postUrl, {
              ...reqOptions,
              method: 'POST',
            })
          ),
          handler(
            new Request(putDelUrl, {
              ...reqOptions,
              method: 'PUT',
            })
          ),
          handler(
            new Request(putDelUrl, {
              ...reqOptions,
              method: 'DELETE',
            })
          ),
        ]);

        // Expect each request to have failed with a 401
        for (const res of responses) {
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          expect(res.headers.get('Content-Type')).toBe('application/json');
        }
      }
    );

    test.todo('POST /api/courses');
    test.todo('PUT /api/courses/:id');

    test.each([
      ['nonexistent course', 404, 0, 1],
      ['course being deleted by user other than owner', 403, 1, 0],
      ['course being deleted by owner', 204, 0, 0],
    ] satisfies [string, number, number, number][])(
      'DELETE /api/course/:id handles %s with %i status',
      async (_, status, userIdx, courseIdx) => {
        // Setup request
        const courseId = courseIds[courseIdx];
        const url = endpoint(`/api/courses/${encodeURIComponent(courseId)}`);
        const credentials = [
          userInputs[userIdx].emailAddress,
          userInputs[userIdx].password,
        ].join(':');
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const req = new Request(url, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
          },
        });

        // Make request
        const res = await handler(req);

        // Expect status to match fixture data
        expect(res.status).toBe(status);
      }
    );
  });
});
