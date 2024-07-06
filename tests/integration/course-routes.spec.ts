import { asClass, asFunction, type AwilixContainer } from 'awilix';
import { toWebHandler, type WebHandler } from 'h3';
import {
  dropTestDb,
  generateTestDbUrl,
  initTestDb,
  makeTestPrismaClient,
  truncateTables,
} from 'tests/db.ts';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container, type FullDeps } from '~/container.ts';
import { courseDetail, coursePreview } from '~/selects/course.ts';
import { CourseService } from '~/services/course.ts';
import { UserService } from '~/services/user.ts';

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

  afterEach(async () => {
    await truncateTables(databaseUrl);
  });

  test('GET /api/courses retrieves course listing', async () => {
    // Seed database with test data
    const prisma = scope.resolve('prisma');

    const { courses: expectedCourses } = await prisma.user.create({
      data: await userWithCourses(fakeUserInput(), fakeCourses()),
      select: {
        courses: {
          select: coursePreview(),
        },
      },
    });

    // Query for course list
    const res = await handler(new Request(endpoint('/api/courses')));

    // Expect a successful JSON response with the correct course listing
    expect(res.ok).toBe(true);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    await expect(res.json()).resolves.toStrictEqual(expectedCourses);
  });

  test('GET /api/courses/:id retrieves full course details for courses that exist', async () => {
    // Seed database with test data
    const prisma = scope.resolve('prisma');

    const { courses } = await prisma.user.create({
      data: await userWithCourses(fakeUserInput(), fakeCourses()),
      select: {
        courses: {
          select: courseDetail(),
        },
      },
    });

    // Get course details for each created course
    for (const course of courses) {
      const path = `/api/courses/${encodeURIComponent(course.id)};`;

      const res = await handler(new Request(endpoint(path)));

      // Expect each course request to result in a successful JSON response with the correct data
      expect(res.ok).toBe(true);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      await expect(res.json()).resolves.toStrictEqual(course);
    }
  });

  test('GET /api/courses/:id returns 404 for a nonexistent course', async () => {
    // Request the data for a course without any existing in the database
    const res = await handler(new Request(endpoint('/api/courses/1')));

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });

  test.todo('POST /api/courses');
  test.todo('PUT /api/courses/:id');
  test.todo('DELETE /api/courses/:id');
});
