// Imports
import { classToPlain } from 'class-transformer';
import { random } from 'faker';
import http from 'http';
import fetch from 'isomorphic-unfetch';
import listen from 'test-listen';
import tv4 from 'tv4';

import app from '@/app';
import { generateTestCourseDto } from '@/utils/testing/course';
import { generateTestUserDto } from '@/utils/testing/user';

// Test setup
function withServer(callback: (url: string) => void | Promise<void>) {
  return async () => {
    // Create HTTP server from app
    const server = http.createServer(app);

    // Listen on ephemeral port and retrieve URL
    const url = await listen(server);

    try {
      // Pass URL to callback
      await callback(url);
    } finally {
      // Close server when done
      server.close();
    }
  };
}

async function setupTestUser(url: string) {
  // Generate test user data
  const userDto = generateTestUserDto();
  const userData = classToPlain(userDto);

  // Define request body
  const body = JSON.stringify(userData);

  // Create user through API
  await fetch(`${url}/api/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body,
  });

  // Return user data
  return userDto;
}

async function setupTestCourse(url: string, credentials: string) {
  // Generate test course
  const courseDto = generateTestCourseDto();
  const courseData = classToPlain(courseDto);

  // Create course through API
  const res = await fetch(`${url}/api/courses`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${credentials}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  // Get value of Location header
  const location = res.headers.get('location')!;

  // Extract new course ID from Location header
  const [id] = /[A-Z2-7]{16}$/.exec(location)!;

  // Return new course ID and course data
  return { id, courseDto };
}

describe('Course API Routes', () => {
  test(
    'GET /api/courses should respond with course listing',
    withServer(async (url) => {
      // Make request to API
      const res = await fetch(`${url}/api/courses`);

      // Expect successful response with 200 status
      expect(res.ok).toBeTruthy();
      expect(res.status).toBe(200);

      // Get response body as JSON
      const body = (await res.json()) as unknown;

      // Setup schemas
      const { default: userSchema } = await import('./user.schema.json');
      const { default: courseSchema } = await import('./course.schema.json');
      const { default: coursesSchema } = await import('./courses.schema.json');

      tv4.addSchema('userSchema', userSchema);
      tv4.addSchema('courseSchema', courseSchema);

      // Expect body to match schema
      expect(tv4.validate(body, coursesSchema)).toBeTruthy();
    })
  );

  describe('POST /api/courses', () => {
    it(
      'should respond with 201 when given valid course data and auth',
      withServer(async (url) => {
        // Setup test user for authentication
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Generate test course
        const courseDto = generateTestCourseDto();
        const courseData = classToPlain(courseDto);

        // Make request to API
        const res = await fetch(`${url}/api/courses`, {
          method: 'POST',
          headers: {
            authorization: `Basic ${credentials}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        // Expect successful response with 201 status
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(201);

        // Expect Location header to be present with path to new course
        expect(res.headers.keys()).toContain('location');
        expect(res.headers.get('location')).toEqual(
          expect.stringMatching(new RegExp(`/api/courses/[A-Z2-7]{16}$`))
        );
      })
    );

    it(
      'should respond with 401 when no authentication is provided',
      withServer(async (url) => {
        // Make request to API
        const res = await fetch(`${url}/api/courses`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Expect failed response with 401 status
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );

    it(
      'should respond with 400 when given valid auth but invalid course data',
      withServer(async (url) => {
        // Setup test user for authentication
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Make request to API
        const res = await fetch(`${url}/api/courses`, {
          method: 'POST',
          headers: {
            authorization: `Basic ${credentials}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Expect failed response with 400 status
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(400);
      })
    );
  });

  describe('GET /api/courses/:id', () => {
    it(
      'should respond with course with given ID if found',
      withServer(async (url) => {
        // Setup test user for authentication
        const {
          firstName,
          lastName,
          emailAddress,
          password,
        } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { courseDto, id: courseId } = await setupTestCourse(
          url,
          credentials
        );

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          headers: {
            accept: 'application/json',
            authorization: `Basic ${credentials}`,
          },
        });

        // Expect successful response
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(200);

        // Get response body as JSON
        const body = (await res.json()) as unknown;

        // Setup schemas
        const { default: userSchema } = await import('./user.schema.json');
        const { default: courseSchema } = await import('./course.schema.json');

        tv4.addSchema('userSchema', userSchema);

        // Expect response body to match course schema
        expect(tv4.validate(body, courseSchema)).toBeTruthy();

        // Expect course data to match input and user data
        expect(body).toHaveProperty('id', courseId);
        expect(body).toHaveProperty('title', courseDto.title);
        expect(body).toHaveProperty('description', courseDto.description);
        expect(body).toHaveProperty('estimatedTime', courseDto.estimatedTime);
        expect(body).toHaveProperty(
          'materialsNeeded',
          courseDto.materialsNeeded
        );
        expect(body).toHaveProperty('creator.firstName', firstName);
        expect(body).toHaveProperty('creator.lastName', lastName);
        expect(body).toHaveProperty('creator.emailAddress', emailAddress);
      })
    );

    it(
      'should respond with 404 if no course exists with given ID',
      withServer(async (url) => {
        // Generate unused ID
        const unusedId = random.alphaNumeric(16);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${unusedId}`, {
          headers: {
            accept: 'application/json',
          },
        });

        // Expect failed response with 404 status
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(404);
      })
    );
  });

  describe('PUT /api/courses', () => {
    it(
      'should respond with 204 when given valid course data and auth, and have applied the updates',
      withServer(async (url) => {
        // Setup test user to create course
        const {
          firstName,
          lastName,
          emailAddress,
          password,
        } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { id: courseId } = await setupTestCourse(url, credentials);

        // Generate unused ID and update data
        const updateDto = generateTestCourseDto();
        const updateData = classToPlain(updateDto);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            authorization: `Basic ${credentials}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        // Expect successful response with status 204
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(204);

        // Attempt to retrieve updated course
        const res2 = await fetch(`${url}/api/courses/${courseId}`, {
          headers: {
            accept: 'application/json',
          },
        });

        // Expect course to be found
        expect(res2.ok).toBeTruthy();
        expect(res2.status).toBe(200);

        // Get response body as JSON
        const body = (await res2.json()) as unknown;

        // Setup schemas
        const { default: userSchema } = await import('./user.schema.json');
        const { default: courseSchema } = await import('./course.schema.json');

        tv4.addSchema('userSchema', userSchema);

        // Expect response body to match course schema
        expect(tv4.validate(body, courseSchema)).toBeTruthy();

        // Expect course data to match input and user data
        expect(body).toHaveProperty('id', courseId);
        expect(body).toHaveProperty('title', updateDto.title);
        expect(body).toHaveProperty('description', updateDto.description);
        expect(body).toHaveProperty('estimatedTime', updateDto.estimatedTime);
        expect(body).toHaveProperty(
          'materialsNeeded',
          updateDto.materialsNeeded
        );
        expect(body).toHaveProperty('creator.firstName', firstName);
        expect(body).toHaveProperty('creator.lastName', lastName);
        expect(body).toHaveProperty('creator.emailAddress', emailAddress);
      })
    );

    it(
      'should respond with 401 when no authentication is provided',
      withServer(async (url) => {
        // Generate unused ID
        const unusedId = random.alphaNumeric(16);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${unusedId}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Expect failed response with status 401
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );

    it(
      'should respond with 403 when one user attempts to update course belonging to another user',
      withServer(async (url) => {
        // Setup test user to create course
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { id: courseId } = await setupTestCourse(url, credentials);

        // Setup another test user
        const { emailAddress: email2, password: pass2 } = await setupTestUser(
          url
        );

        // Encode credentials
        const credentials2 = Buffer.from(`${email2}:${pass2}`).toString(
          'base64'
        );

        // Generate unused ID and update data
        const updateDto = generateTestCourseDto();
        const updateData = classToPlain(updateDto);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            authorization: `Basic ${credentials2}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        // Expect failed response with status 403
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(403);
      })
    );

    it(
      'should respond with 404 if no course exists with given ID',
      withServer(async (url) => {
        // Setup test user for authentication
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Generate unused ID and update data
        const unusedId = random.alphaNumeric(16);
        const updateDto = generateTestCourseDto();
        const updateData = classToPlain(updateDto);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${unusedId}`, {
          method: 'PUT',
          headers: {
            authorization: `Basic ${credentials}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        // Expect failed response with status 404
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(404);
      })
    );

    it(
      'should respond with 400 when given valid auth but invalid course data',
      withServer(async (url) => {
        // Setup test user to create course
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { id: courseId } = await setupTestCourse(url, credentials);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            authorization: `Basic ${credentials}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Expect failed response with status 404
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(400);
      })
    );
  });

  describe('DELETE /api/courses', () => {
    it(
      'should respond with 204 when given valid authentication, and make course irretrievable by ID',
      withServer(async (url) => {
        // Setup test user for authentication
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { id: courseId } = await setupTestCourse(url, credentials);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            authorization: `Basic ${credentials}`,
          },
        });

        // Expect successful response with status 204
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(204);

        // Attempt to retrieve course again
        const res2 = await fetch(`${url}/api/courses/${courseId}`);

        // Expect course to not be found
        expect(res2.ok).toBeFalsy();
        expect(res2.status).toBe(404);
      })
    );

    it(
      'should respond with 401 when no authentication is provided',
      withServer(async (url) => {
        // Generate unused ID
        const unusedId = random.alphaNumeric(16);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${unusedId}`, {
          method: 'DELETE',
        });

        // Expect failed response with status 401
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );

    it(
      'should respond with 403 when one user attempts to delete course belonging to another user',
      withServer(async (url) => {
        // Setup test user to create course
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Setup test course
        const { id: courseId } = await setupTestCourse(url, credentials);

        // Setup another test user
        const { emailAddress: email2, password: pass2 } = await setupTestUser(
          url
        );

        // Encode credentials
        const credentials2 = Buffer.from(`${email2}:${pass2}`).toString(
          'base64'
        );

        // Make request to API
        const res = await fetch(`${url}/api/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            authorization: `Basic ${credentials2}`,
          },
        });

        // Expect failed response with status 403
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(403);
      })
    );

    it(
      'should respond with 404 if no course exists with given ID',
      withServer(async (url) => {
        // Setup test user for authentication
        const { emailAddress, password } = await setupTestUser(url);

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Generate unused ID
        const unusedId = random.alphaNumeric(16);

        // Make request to API
        const res = await fetch(`${url}/api/courses/${unusedId}`, {
          method: 'DELETE',
          headers: {
            authorization: `Basic ${credentials}`,
          },
        });

        // Expect failed response with status 404
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(404);
      })
    );
  });
});
