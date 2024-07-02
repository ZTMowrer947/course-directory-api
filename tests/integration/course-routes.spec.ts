import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';
import argon2 from 'argon2';
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

    const [firstName, lastName] = [
      faker.person.firstName(),
      faker.person.lastName(),
    ];
    const userData = {
      firstName,
      lastName,
      emailAddress: faker.internet.email({ firstName, lastName }),
      password: await argon2.hash(faker.internet.password({ length: 12 })),
    } satisfies Prisma.UserCreateWithoutCoursesInput;

    const courseData = Array.from({ length: 2 }, () => {
      return {
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
      } satisfies Prisma.CourseCreateManyUserInput;
    });

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
});
