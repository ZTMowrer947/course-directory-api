import { STATUS_CODES } from 'node:http';

import { createError, createRouter, eventHandler } from 'h3';

import { prisma } from '../prisma-client.ts';

const courses = createRouter();

// GET /api/courses: Retrive list of all courses
courses.get(
  '/courses',
  eventHandler(async () => {
    return prisma.course.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  })
);

courses.get(
  '/courses/:id',
  eventHandler(async (event) => {
    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    const course = await prisma.course.findUnique({
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

    return (
      course ??
      createError({
        status: 404,
        statusMessage: STATUS_CODES[404],
        message: 'Course not found',
      })
    );
  })
);

export default courses;
