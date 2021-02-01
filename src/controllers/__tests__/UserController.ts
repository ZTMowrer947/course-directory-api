// Imports
import { plainToClass } from 'class-transformer';
import UserModifyDTO from '../../models/UserModifyDTO';
import agent from '../../koaTestAgent';
import app from '../../app';

// Test Suite
describe('/api/users', () => {
  let userData: UserModifyDTO;

  // Run before all tests
  beforeAll(() => {
    const plainData = {
      firstName: 'Jester',
      lastName: 'Tester',
      emailAddress: 'jestert39018@jestjs.io',
      password: 'ch@0schaos',
    };

    userData = plainToClass(UserModifyDTO, plainData);
  });

  describe('POST', () => {
    it('should create a user given valid data', async () => {
      // Make API request
      const response = await agent(app).post('/api/users').send(userData);

      // Expect a 201 response
      expect(response.status).toBe(201);
    });

    it('should return a validation error when given invalid data', async () => {
      // Define invalid data
      const invalidPlainData = {
        firstName: '',
        lastName: '',
        emailAddress: 'invalid',
        password: 'nope',
      };

      const invalidData = plainToClass(UserModifyDTO, invalidPlainData);

      // Make API request
      const response = await agent(app).post('/api/users').send(invalidData);

      // Expect a 400 response
      expect(response.status).toBe(400);

      // Expect response body to have errors property
      expect(response.body).toHaveProperty('errors');
    });

    it('should return a 400 error when trying to create a user with an email address in use by another user', async () => {
      // Make API request
      const response = await agent(app).post('/api/users').send(userData);

      // Expect a 400 response
      expect(response.status).toBe(400);
    });
  });

  describe('GET', () => {
    it('should return a 401 error if no authorization is provided', async () => {
      // Make API request
      const response = await agent(app).get('/api/users');

      // Expect a 401 response
      expect(response.status).toBe(401);
    });

    it('should return the proper user data when proper authentication is provided', async () => {
      // Make API request
      const response = await agent(app)
        .get('/api/users')
        .auth(userData.emailAddress, userData.password);

      // Expect a 200 response
      expect(response.status).toBe(200);

      const user: unknown = response.body;

      // Expect user data to match input data
      expect(user).toHaveProperty('firstName', userData.firstName);
      expect(user).toHaveProperty('lastName', userData.lastName);
      expect(user).toHaveProperty('emailAddress', userData.emailAddress);

      // Expect password field to not be present in response data
      expect(user).not.toHaveProperty('password');
    });
  });
});
