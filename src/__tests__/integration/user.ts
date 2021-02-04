// Imports
import { classToPlain } from 'class-transformer';
import { internet } from 'faker';
import http from 'http';
import fetch from 'isomorphic-unfetch';
import listen from 'test-listen';
import tv4 from 'tv4';

import app from '@/app';
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

// Test Suite
describe('User API Routes', () => {
  describe('POST /api/users', () => {
    it(
      'should respond with 201 when user data is valid',
      withServer(async (url) => {
        // Generate test user data
        const userDto = generateTestUserDto();
        const userData = classToPlain(userDto);

        // Define request body
        const body = JSON.stringify(userData);

        // Make request to API
        const res = await fetch(`${url}/api/users`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body,
        });

        // Expect successful response with status 201
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(201);
      })
    );

    it(
      'should respond with 400 when user data is invalid',
      withServer(async (url) => {
        // Make request to API
        const res = await fetch(`${url}/api/users`, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Expect failed response with status 400
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(400);
      })
    );
  });

  describe('GET /api/users', () => {
    it(
      'should respond with user data when provided correct authentication',
      withServer(async (url) => {
        // Generate test user
        const userData = await setupTestUser(url);

        const { emailAddress, password } = userData;

        // Encode credentials
        const credentials = Buffer.from(`${emailAddress}:${password}`).toString(
          'base64'
        );

        // Make request to API
        const res = await fetch(`${url}/api/users`, {
          headers: {
            authorization: `Basic ${credentials}`,
            accept: 'application/json',
          },
        });

        // Expect success response with 200 status
        expect(res.ok).toBeTruthy();
        expect(res.status).toBe(200);

        // Get response body
        const body = (await res.json()) as unknown;

        // Expect body to match JSON schema
        const { default: userSchema } = await import('./user.schema.json');
        expect(tv4.validate(body, userSchema)).toBeTruthy();

        // Expect body to match user data
        expect(body).toHaveProperty(
          'id',
          expect.stringMatching(/[A-Z2-7]{16}/)
        );
        expect(body).toHaveProperty('firstName', userData.firstName);
        expect(body).toHaveProperty('lastName', userData.lastName);
        expect(body).toHaveProperty('emailAddress', userData.emailAddress);
      })
    );

    it(
      'should respond with 401 if no authentication is provided',
      withServer(async (url) => {
        // Make request to API
        const res = await fetch(`${url}/api/users`);

        // Expect failed response with status 401
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );

    it(
      'should respond with 401 if email is incorrect',
      withServer(async (url) => {
        // Generate test user and incorrect email
        const { password } = await setupTestUser(url);
        const incorrectEmail = internet.exampleEmail();

        // Encode credentials
        const credentials = Buffer.from(
          `${incorrectEmail}:${password}`
        ).toString('base64');

        // Make request to API
        const res = await fetch(`${url}/api/users`, {
          headers: {
            authorization: `Basic ${credentials}`,
          },
        });

        // Expect failed response with status 401
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );

    it(
      'should respond with 401 if password is incorrect',
      withServer(async (url) => {
        // Generate test user and incorrect password
        const { emailAddress } = await setupTestUser(url);
        const incorrectPass = internet.password(16);

        // Encode credentials
        const credentials = Buffer.from(
          `${emailAddress}:${incorrectPass}`
        ).toString('base64');

        // Make request to API
        const res = await fetch(`${url}/api/users`, {
          headers: {
            authorization: `Basic ${credentials}`,
          },
        });

        // Expect failed response with status 401
        expect(res.ok).toBeFalsy();
        expect(res.status).toBe(401);
      })
    );
  });
});
