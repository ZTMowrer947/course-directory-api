import {
  createError,
  createRouter,
  eventHandler,
  setResponseHeader,
  setResponseStatus,
} from 'h3';

import { getUserOrFail } from '~/composables/auth.ts';
import { useCORS } from '~/composables/cors';
import { getDependency } from '~/composables/di.ts';
import readValidatedBody from '~/composables/validate.ts';
import { CourseInput } from '~/validation/course.ts';

const courses = createRouter();

// GET /api/courses: Retrive list of all courses
courses.get(
  '/courses',
  eventHandler(async (event) => {
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST'],
      credentials: false,
    });

    if (didHandleCors) return;

    return getDependency(event, 'courseService').getAll();
  })
);

// POST /api/courses/:id, creates a new post
courses.post(
  '/courses',
  eventHandler(async (event) => {
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST'],
      credentials: true,
    });

    if (didHandleCors) return;

    // Validate authentication, then course data
    const user = await getUserOrFail(event);
    const courseData = await readValidatedBody(event, CourseInput);

    // Attempt to create course, attaching to authenticated user
    const service = getDependency(event, 'courseService');
    const newCourse = await service.create(courseData, user);

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
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
      credentials: false,
    });

    if (didHandleCors) return;

    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const service = getDependency(event, 'courseService');
    const course = await service.get(id);

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
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    if (didHandleCors) return;

    const user = await getUserOrFail(event);

    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const service = getDependency(event, 'courseService');
    const courseToUpdate = await service.get(id);

    if (!courseToUpdate)
      throw createError({ status: 404, statusMessage: 'Course not found' });
    else if (courseToUpdate.userId !== user.id)
      throw createError({
        status: 403,
        statusMessage: 'Not allowed to modify course of another user',
      });

    // Parse request body for update data
    const updateData = await readValidatedBody(event, CourseInput);

    // Perform the update, return 204 if successful
    await service.update(courseToUpdate, updateData);

    return null;
  })
);

// DELETE /api/courses/:id, deletes a course
courses.delete(
  '/courses/:id',
  eventHandler(async (event) => {
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    if (didHandleCors) return;

    const user = await getUserOrFail(event);

    // Parse ID route parameter
    const idParam = event.context.params?.id ?? '';
    const id = Number.parseInt(idParam, 10);

    // Retrieve course from database
    const service = getDependency(event, 'courseService');
    const courseToDelete = await service.get(id);

    if (!courseToDelete)
      throw createError({ status: 404, statusMessage: 'Course not found' });
    else if (courseToDelete.userId !== user.id)
      throw createError({
        status: 403,
        statusMessage: 'Not allowed to modify course of another user',
      });

    await service.delete(courseToDelete);

    return null;
  })
);

export default courses;
