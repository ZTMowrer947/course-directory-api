import {
  createError,
  createRouter,
  eventHandler,
  getHeader,
  H3Event,
  setResponseHeader,
  setResponseStatus,
} from 'h3';

import { getUserOrFail } from '~/composables/auth.ts';
import { getDependency } from '~/composables/di.ts';
import readValidatedBody from '~/composables/validate.ts';
import { CourseInput } from '~/validation/course.ts';

// Route-specific composables
async function fetchCourseById(event: H3Event, id: number) {
  // Retrieve course from database
  const prisma = getDependency(event, 'prisma');

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
  eventHandler(async (event) => {
    const prisma = getDependency(event, 'prisma');

    return prisma.course.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  })
);

// POST /api/courses/:id, creates a new post
courses.post(
  '/courses',
  eventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization') ?? '';

    // Validate authentication, then course data
    const user = await getUserOrFail(authHeader);
    const courseData = await readValidatedBody(event, CourseInput);

    // Attempt to create course, attaching to authenticated user
    const prisma = getDependency(event, 'prisma');
    const newCourse = await prisma.course.create({
      data: {
        ...courseData,
        user: {
          connect: {
            id: user.id,
          },
        },
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

    setResponseStatus(event, 201, 'Created');
    setResponseHeader(
      event,
      'Location',
      `/api/courses/${encodeURIComponent(newCourse.id)}`
    );

    return newCourse;
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
    const course = await fetchCourseById(event, id);

    // Return retrieved course, or error if not found
    if (course) {
      return course;
    } else {
      throw createError({
        status: 404,
        statusMessage: 'Course not found',
      });
    }
  })
);

// PUT /api/courses/:id, updates a course's data
courses.put(
  '/courses/:id',
  eventHandler(async (event) => {
    1;
    const authHeader = getHeader(event, 'Authorization') ?? '';

    const user = await getUserOrFail(authHeader);

    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const courseToUpdate = await fetchCourseById(event, id);

    if (!courseToUpdate)
      throw createError({ status: 404, statusMessage: 'Course not found' });
    else if (courseToUpdate.userId !== user.id)
      throw createError({
        status: 403,
        statusMessage: 'Not allowed to modify course of another user',
      });

    // Parse request body for update data
    const updateData = await readValidatedBody(event, CourseInput);
    const prisma = getDependency(event, 'prisma');

    // Perform the update, return 204 if successful
    await prisma.course.update({
      where: {
        id: courseToUpdate.id,
      },
      data: updateData,
    });

    return null;
  })
);

// DELETE /api/courses/:id, deletes a course
courses.delete(
  '/courses/:id',
  eventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization') ?? '';

    const user = await getUserOrFail(authHeader);

    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const courseToDelete = await fetchCourseById(event, id);

    if (!courseToDelete)
      throw createError({ status: 404, statusMessage: 'Course not found' });
    else if (courseToDelete.userId !== user.id)
      throw createError({
        status: 403,
        statusMessage: 'Not allowed to modify course of another user',
      });

    const prisma = getDependency(event, 'prisma');

    await prisma.course.delete({
      where: {
        id: courseToDelete.id,
      },
    });

    return null;
  })
);

export default courses;
