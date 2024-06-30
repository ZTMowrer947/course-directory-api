import { createRouter, eventHandler } from 'h3';

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

export default courses;
