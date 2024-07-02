import mysql from 'mysql2/promise';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  test,
  vi,
} from 'vitest';

import { fakeCourses, fakeUser } from './fake.ts';
import { getAppHandler, prismaMock } from './utils.ts';

describe('Integration API tests', () => {
  beforeEach(() => {
    // Mock Prisma Client to point to test database
    vi.doMock(`~/prisma-client.ts`, prismaMock);
  });

  // Clear mock
  afterEach(async () => {
    vi.clearAllMocks();

    const conn = await mysql.createConnection(inject('testDatabaseUrl'));

    try {
      // Truncate tables, dropping and re-creating foreign key
      await conn.execute('TRUNCATE TABLE `Course`;');
      await conn.execute(
        'ALTER TABLE `Course` DROP FOREIGN KEY `course_ibfk_1`;'
      );
      await conn.execute('TRUNCATE TABLE `User`;');
      await conn.execute(
        'ALTER TABLE `Course` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;'
      );

      // Restart primary key numbering
      await conn.execute('ALTER TABLE `Course` AUTO_INCREMENT=1;');
      await conn.execute('ALTER TABLE `User` AUTO_INCREMENT=1;');
    } finally {
      await conn.end();
    }
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
    const url = new URL('/api/courses', 'http://localhost:5000');

    const res = await handler(new Request(url));

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
      const url = new URL(
        `/api/courses/${encodeURIComponent(course.id)}`,
        'http://localhost:3000'
      );

      const res = await handler(new Request(url));

      // Expect each course request to result in a successful JSON response with the correct data
      expect(res.ok).toBe(true);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      await expect(res.json()).resolves.toStrictEqual(course);
    }
  });

  test('GET /api/courses/:id returns 404 for a nonexistent course', async () => {
    // Request the data for a course without any existing in the database
    const handler = await getAppHandler();

    const url = new URL('/api/courses/1', 'http://localhost:5000');
    const res = await handler(new Request(url));

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });
});
