import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fakeCourses, fakeUser } from './fake.ts';
import {
  endpoint,
  getAppHandler,
  prismaMock,
  truncateTestDatabaseTables,
} from './utils.ts';

describe('API Integration tests, course-related routes', () => {
  beforeEach(() => {
    // Mock Prisma Client to point to test database
    vi.doMock(`~/prisma-client.ts`, prismaMock);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await truncateTestDatabaseTables();
  });

  test('GET /api/courses retrieves course listing', async () => {
    // Seed database with test data
    const { prisma } = await import('~/prisma-client.ts');

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
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Setup web handler
    const handler = await getAppHandler();

    // Query for course list
    const res = await handler(new Request(endpoint('/api/courses')));

    // Expect a successful JSON response with the correct course listing
    expect(res.ok).toBe(true);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    await expect(res.json()).resolves.toStrictEqual(expectedCourses);
  });

  test('GET /api/courses/:id retrieves full course details for courses that exist', async () => {
    // Seed database with test data
    const { prisma } = await import('~/prisma-client.ts');

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
        },
      },
    });

    const handler = await getAppHandler();

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
    const handler = await getAppHandler();

    const res = await handler(new Request(endpoint('/api/courses/1')));

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });

  test.todo('POST /api/courses');
  test.todo('PUT /api/courses/:id');
  test.todo('DELETE /api/courses/:id');
});
