import { faker } from '@faker-js/faker';
import { asClass, asFunction, type AwilixContainer } from 'awilix';
import { toWebHandler, type WebHandler } from 'h3';
import { beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container, type FullDeps } from '~/container.ts';
import { CourseService } from '~/services/course.ts';
import { UserService } from '~/services/user.ts';
import type { UserInputData } from '~/validation/user.ts';
import {
  dropTestDb,
  generateTestDbUrl,
  initTestDb,
  makeTestPrismaClient,
  truncateTables,
} from '~tests/db.ts';

import { fakeUserInput } from './fake.ts';
import { userFromInput } from './selects.ts';
import { endpoint } from './utils.ts';
import type { TestCase, ValidationTestCase } from './utiltype.ts';

// Test suite
describe('API Integration tests, user-related routes', () => {
  let databaseUrl: string;
  let handler: WebHandler;
  let scope: AwilixContainer<FullDeps>;

  beforeAll(async () => {
    // Generate unique database URL and initalize test database
    databaseUrl = generateTestDbUrl();

    await initTestDb(databaseUrl);

    // Create DI scope for test suite
    scope = container.createScope();

    // Provide Prisma database client specific for this suite
    scope.register(
      'prisma',
      asFunction(makeTestPrismaClient)
        .inject(() => ({ url: databaseUrl }))
        .scoped()
    );

    // Register other services
    scope.register({
      userService: asClass(UserService).scoped(),
      courseService: asClass(CourseService).scoped(),
    });

    // Initialize app under test with scoped container
    const app = initApp(scope);
    handler = toWebHandler(app);

    return async () => {
      await dropTestDb(databaseUrl);
    };
  });

  describe('GET /api/users', () => {
    const actualUserInput = fakeUserInput();

    beforeAll(async () => {
      const prisma = scope.resolve('prisma');

      await prisma.user.create({
        data: await userFromInput(actualUserInput),
      });

      return async () => {
        await truncateTables(databaseUrl);
      };
    });

    test.each([
      {
        name: 'No credentials',
        expectedResult: '401',
        input: null,
        status: 401,
        ok: false,
        errorExpectation: {},
      },
      {
        name: 'Empty credentials',
        expectedResult: '401',
        input: ['', ''],
        status: 401,
        ok: false,
        errorExpectation: {},
      },
      {
        name: 'Invalid credentials',
        expectedResult: '401',
        // Credentials not attached to any user
        input: [faker.internet.email(), faker.internet.password()],
        status: 401,
        ok: false,
        errorExpectation: {},
      },
      {
        name: 'Correct email, incorrect password',
        expectedResult: '401',
        input: [actualUserInput.emailAddress, faker.internet.password()],
        status: 401,
        ok: false,
        errorExpectation: {},
      },
      {
        name: 'Valid credentials',
        expectedResult: '200',
        input: [actualUserInput.emailAddress, actualUserInput.password],
        status: 200,
        ok: true,
      },
    ] satisfies TestCase<[string, string] | null, Record<string, never>>[])(
      '$name yields result of $expectedResult',
      async (fixture) => {
        // Setup request
        const url = endpoint('/api/users');
        const req = new Request(url);

        // If credentials are provided, encode them and attach to request
        if (fixture.input) {
          const encoded = Buffer.from(fixture.input.join(':')).toString(
            'base64'
          );

          req.headers.set('Authorization', `Basic ${encoded}`);
        }

        // Make request
        const res = await handler(req);

        // Ensure response fulfills expectations of fixture
        expect(res.ok).toEqual(fixture.ok);
        expect(res.status).toEqual(fixture.status);
        expect(res.headers.get('Content-Type')).toBe('application/json');

        if (fixture.ok) {
          // For valid input, assert that output data properly represents user
          const body = await res.json();

          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('firstName', actualUserInput.firstName);
          expect(body).toHaveProperty('lastName', actualUserInput.lastName);
          expect(body).toHaveProperty(
            'emailAddress',
            actualUserInput.emailAddress
          );
          // Ensure passworrd is not exposed in any form
          expect(body).not.toHaveProperty('password');
        }
      }
    );
  });

  describe('POST /api/users', () => {
    const existingUserInput = fakeUserInput();

    beforeAll(async () => {
      const prisma = scope.resolve('prisma');

      // Crerate user with pre-generated input for testing "existing user" case
      await prisma.user.create({
        data: await userFromInput(existingUserInput),
      });

      return async () => {
        await truncateTables(databaseUrl);
      };
    });

    test.each([
      // All fields empty
      {
        name: 'Body with empty fields',
        expectedResult: '400',
        input: {
          firstName: '',
          lastName: '',
          emailAddress: '',
          password: '',
        },
        status: 400,
        ok: false,
        errorExpectation: {
          invalidFields: ['firstName', 'lastName', 'emailAddress', 'password'],
          getExpectedMessages(fieldName) {
            const messages = [`${fieldName} required but not provided`];

            if (fieldName === 'emailAddress') {
              messages.push('emailAddress must be a valid email');
            } else if (fieldName === 'password') {
              messages.splice(0, 1, 'password must have length of at least 8');
            }

            return messages;
          },
        },
      },
      // Only invalid email
      {
        name: 'Body with invalid email',
        expectedResult: '400',
        input: {
          ...fakeUserInput(),
          emailAddress: 'notgoodemail',
        },
        status: 400,
        ok: false,
        errorExpectation: {
          invalidFields: ['emailAddress'],
          getExpectedMessages() {
            return ['emailAddress must be a valid email'];
          },
        },
      },
      // Only poor-strength password
      {
        name: 'Body with invalid password',
        expectedResult: '400',
        input: {
          ...fakeUserInput(),
          password: 'wtf',
        },
        status: 400,
        ok: false,
        errorExpectation: {
          invalidFields: ['password'],
          getExpectedMessages() {
            return ['password must have length of at least 8'];
          },
        },
      },
      // Valid input
      {
        name: 'Body with valid data',
        expectedResult: '201',
        input: fakeUserInput(),
        status: 201,
        ok: true,
      },
      // Email of existing user
      {
        name: 'Body with existing user email',
        expectedResult: '400',
        input: existingUserInput,
        status: 400,
        ok: false,
        errorExpectation: {
          invalidFields: ['emailAddress'],
          getExpectedMessages() {
            return ['email address is already in use'];
          },
        },
      },
    ] satisfies ValidationTestCase<UserInputData>[])(
      '$name yields result of $expectedResult',
      async ({ input, ok, status, errorExpectation }) => {
        // Add helpers for URL and shared request options
        const url = endpoint('/api/users');
        const getReqOptions = (input: UserInputData): RequestInit => {
          return {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          };
        };

        // Make request
        const res = await handler(new Request(url, getReqOptions(input)));

        // Make assertions based on test data
        expect(res.ok).toEqual(ok);
        expect(res.status).toBe(status);
        expect(res.headers.get('Content-Type')).toBe('application/json');

        const body = await res.json();

        if (errorExpectation) {
          // For invalid input, assert on validation errors
          for (const field of errorExpectation.invalidFields) {
            expect(body).toHaveProperty(
              ['data', 'errors', field],
              errorExpectation.getExpectedMessages(field)
            );
          }
        } else {
          // For valid input, assert that output data properly represents user
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('firstName', input.firstName);
          expect(body).toHaveProperty('lastName', input.lastName);
          expect(body).toHaveProperty('emailAddress', input.emailAddress);
          // Ensure passworrd is not exposed in any form
          expect(body).not.toHaveProperty('password');
        }
      }
    );
  });
});
