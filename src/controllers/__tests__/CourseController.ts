// Imports
import { plainToClass } from 'class-transformer';

import CourseModifyDTO from '@/models/CourseModifyDTO';
import agent from '@/koaTestAgent';
import app from '@/app';

// Test Suite
describe('/api/courses', () => {
  let courseData: CourseModifyDTO;
  let id: string;
  let unusedId: string;

  // Run before all tests
  beforeAll(() => {
    // Define course data
    const plainData = {
      title: 'Agent Test Course',
      description:
        'This course is a test course for the course routes within the Koa application.',
    };

    // Convert to CourseModifyDTO instance
    courseData = plainToClass(CourseModifyDTO, plainData);

    // Define unused ID
    unusedId = 'A'.repeat(16);
  });

  describe('GET', () => {
    it('should retrieve a list of courses', async () => {
      // Make API request
      const response = await agent(app).get('/api/courses');

      // Expect a 200 response
      expect(response.status).toBe(200);

      // Expect response body to contain 3 courses
      expect(response.body).toHaveLength(3);
    });
  });

  describe('POST', () => {
    it('should return a 401 error if no authentication is provided', async () => {
      // Make API request
      const response = await agent(app).post('/api/courses').send(courseData);

      // Expect a 401 response
      expect(response.status).toBe(401);
    });

    it('should create a new course given user authentication and valid data', async () => {
      // Make API request
      const response = await agent(app)
        .post('/api/courses')
        .auth('joe@smith.com', 'joepassword')
        .send(courseData);

      // Expect a 201 response
      expect(response.status).toBe(201);

      // Expect location header to be set correctly
      const { location } = response.header as Record<string, string>;
      expect(location).toEqual(
        expect.stringMatching(/\/api\/courses\/([A-Z2-7]{16})$/)
      );

      // Get ID from location header
      const idMatch = location.match(/[A-Z2-7]{16}$/g);
      expect(idMatch).not.toBeNull();
      [id] = idMatch!;
    });

    it('should return a 400 error when given invalid data', async () => {
      // Define invalid course data
      const invalidPlainData = {
        title: 'invalid'.repeat(32),
        description: '',
      };

      const invalidData = plainToClass(CourseModifyDTO, invalidPlainData);

      // Make API request
      const response = await agent(app)
        .post('/api/courses')
        .auth('joe@smith.com', 'joepassword')
        .send(invalidData);

      // Expect a 400 response
      expect(response.status).toBe(400);

      // Expect response body to have errors property
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('/:id', () => {
    describe('GET', () => {
      it('should return the course with the given ID, if found', async () => {
        // Make API request
        const response = await agent(app).get(`/api/courses/${id}`);

        // Expect a 200 response
        expect(response.status).toBe(200);

        // Get course data
        const course: unknown = response.body;

        // Expect course to match input data
        expect(course).toHaveProperty('id', id);
        expect(course).toHaveProperty('title', courseData.title);
        expect(course).toHaveProperty('description', courseData.description);
      });

      it('should return a 404 error if no course exists with the given ID', async () => {
        // Make API request
        const response = await agent(app).get(`/api/courses/${unusedId}`);

        // Expect a 404 response
        expect(response.status).toBe(404);
      });
    });

    describe('PUT', () => {
      let updateData: CourseModifyDTO;

      // Run before all tests
      beforeAll(() => {
        const plainData = {
          title: 'Updated Course Title',
          description:
            'This is test data for a course updated through the Koa application.',
          estimatedTime: 'A few seconds',
        };

        updateData = plainToClass(CourseModifyDTO, plainData);
      });

      it('should return a 401 error if no authentication is provided', async () => {
        // Make API request
        const response = await agent(app)
          .put(`/api/courses/${id}`)
          .send(updateData);

        // Expect a 401 response
        expect(response.status).toBe(401);
      });

      it('should return a 403 error if the authenticating user did not create the course to be updated', async () => {
        // Make API request
        const response = await agent(app)
          .put(`/api/courses/${id}`)
          .auth('sally@jones.com', 'sallypassword')
          .send(updateData);

        // Expect a 403 response
        expect(response.status).toBe(403);
      });

      it('should return a 404 error if no course exists with the given ID', async () => {
        // Make API request
        const response = await agent(app)
          .put(`/api/courses/${unusedId}`)
          .auth('joe@smith.com', 'joepassword')
          .send(updateData);

        // Expect a 404 response
        expect(response.status).toBe(404);
      });

      it('should update the course with the given ID when given proper user authentication and valid update data', async () => {
        // Make API request
        const response = await agent(app)
          .put(`/api/courses/${id}`)
          .auth('joe@smith.com', 'joepassword')
          .send(updateData);

        // Expect a 204 response
        expect(response.status).toBe(204);
      });

      it('should have successfully applied the updates', async () => {
        // Make API request
        const response = await agent(app).get(`/api/courses/${id}`);

        // Expect a 200 response
        expect(response.status).toBe(200);

        // Get course data
        const course: unknown = response.body;

        // Expect course to match update data
        expect(course).toHaveProperty('id', id);
        expect(course).toHaveProperty('title', updateData.title);
        expect(course).toHaveProperty('description', updateData.description);
        expect(course).toHaveProperty(
          'estimatedTime',
          updateData.estimatedTime
        );
      });
    });

    describe('DELETE', () => {
      it('should return a 401 error if no authentication is provided', async () => {
        // Make API request
        const response = await agent(app).delete(`/api/courses/${id}`);

        // Expect a 401 response
        expect(response.status).toBe(401);
      });

      it('should return a 403 error if the authenticating user did not create the course to be deleted', async () => {
        // Make API request
        const response = await agent(app)
          .delete(`/api/courses/${id}`)
          .auth('sally@jones.com', 'sallypassword');

        // Expect a 403 response
        expect(response.status).toBe(403);
      });

      it('should return a 404 error if no course exists with the given ID', async () => {
        // Make API request
        const response = await agent(app)
          .delete(`/api/courses/${unusedId}`)
          .auth('joe@smith.com', 'joepassword');

        // Expect a 404 response
        expect(response.status).toBe(404);
      });

      it('should delete the course with the given ID when given proper user authentication', async () => {
        // Make API request
        const response = await agent(app)
          .delete(`/api/courses/${id}`)
          .auth('joe@smith.com', 'joepassword');

        // Expect a 204 response
        expect(response.status).toBe(204);
      });

      it('should have successfully deleted the course', async () => {
        // Make API request
        const response = await agent(app).get(`/api/courses/${id}`);

        // Expect a 404 response
        expect(response.status).toBe(404);
      });
    });
  });
});
