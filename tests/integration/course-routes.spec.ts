import { PrismaClient } from '@prisma/client';
import { asValue, type AwilixContainer } from 'awilix';
import { type App, toWebHandler } from 'h3';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container, type FullDeps } from '~/container.ts';
import { courseDetail, coursePreview } from '~/selects/course.ts';

import { fakeCourses, fakeUser } from './fake.ts';
import setupTestDatabase from './setup.ts';
import { endpoint } from './utils.ts';

const { databaseUrl, clearTables } = setupTestDatabase();

describe('API Integration tests, course-related routes', () => {
  let app: App;
  let scope: AwilixContainer<FullDeps>;

  beforeAll(async () => {
    // Create DI scope for test suite
    scope = container.createScope();

    // Provide Prisma database client specific for this suite
    scope.register(
      'prisma',
      asValue(
        new PrismaClient({
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        })
      )
    );

    // Initialize app under test with scoped container
    app = initApp(scope);
  });

  afterEach(async () => {
    await clearTables();
  });

  test('GET /api/courses retrieves course listing', async () => {
    // Seed database with test data
    const prisma = scope.resolve('prisma');

    const userData = await fakeUser();

    const courseData = fakeCourses();

    const { courses: expectedCourses } = await prisma.user.create({
      data: {
        ...userData,
        courses: {
          createMany: {
            data: courseData,
          },
        },
      },
      select: {
        courses: {
          select: coursePreview(),
        },
      },
    });

    // Setup web handler
    const handler = toWebHandler(app);

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

    const userData = await fakeUser();

    const courseData = fakeCourses();

    const { courses } = await prisma.user.create({
      data: {
        ...userData,
        courses: {
          createMany: {
            data: courseData,
          },
        },
      },
      select: {
        courses: {
          select: courseDetail(),
        },
      },
    });

    const handler = toWebHandler(app);

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
    const handler = toWebHandler(app);

    const res = await handler(new Request(endpoint('/api/courses/1')));

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });

  test.todo('POST /api/courses');
  test.todo('PUT /api/courses/:id');
  test.todo('DELETE /api/courses/:id');
});
