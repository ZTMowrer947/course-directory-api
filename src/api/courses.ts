import { STATUS_CODES } from 'node:http';

import { createError, createRouter, eventHandler } from 'h3';

import usePrisma from '~/composables/prisma.ts';

// Route-specific composables
async function fetchCourseById(id: number) {
  // Retrieve course from database
  const prisma = usePrisma();

  return prisma.course.findUnique({
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
}

const courses = createRouter();

// GET /api/courses: Retrive list of all courses
courses.get(
  '/courses',
  eventHandler(async () => {
    const prisma = usePrisma();

    return prisma.course.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  })
);

// GET /api/courses/:id, retrieves a single course or 404's if not found
courses.get(
  '/courses/:id',
  eventHandler(async (event) => {
    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const course = await fetchCourseById(id);

    // Return retrieved course, or error if not found
    if (course) {
      return course;
    } else {
      throw createError({
        status: 404,
        statusMessage: STATUS_CODES[404],
        message: 'Course not found',
      });
    }
  })
);

// PUT /api/courses/:id, updates a course's data
courses.put(
  '/courses/:id',
  eventHandler(() =>
    createError({
      status: 501,
      message: STATUS_CODES[501],
    })
  )
);

// DELETE /api/courses/:id, deletes a course
courses.delete(
  '/courses/:id',
  eventHandler(() =>
    createError({
      status: 501,
      message: STATUS_CODES[501],
    })
  )
);

export default courses;
