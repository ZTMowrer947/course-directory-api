import { asClass, asFunction, type AwilixContainer } from 'awilix';
import { toWebHandler, type WebHandler } from 'h3';
import {
  dropTestDb,
  generateTestDbUrl,
  initTestDb,
  makeTestPrismaClient,
  truncateTables,
} from 'tests/db.ts';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container, type FullDeps } from '~/container.ts';
import { CourseService } from '~/services/course.ts';
import { UserService } from '~/services/user.ts';
import type { UserInputData } from '~/validation/user.ts';

import { fakeUserInput } from './fake.ts';
import { endpoint } from './utils.ts';

// Helper types
interface ErrorExpectation {
  invalidFields: (keyof UserInputData)[];
  getExpectedMessages(key: keyof UserInputData): string[];
}

interface AuthCaseBase<T> {
  name: string;
  expectedResult: string;
  status: number;
  input: T;
}

type AuthCase<T> = AuthCaseBase<T> &
  (
    | {
        ok: true;
      }
    | {
        ok: false;
        errorExpectation: ErrorExpectation;
      }
  );

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

  afterEach(async () => {
    await truncateTables(databaseUrl);
  });

  test.todo('GET /api/users');

  describe('POST /api/users', () => {
    // Define test cases for field
    const testCases = [
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
    ] satisfies AuthCase<UserInputData>[];

    test.each(testCases)(
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
        if (errorExpectation) {
          const body = await res.json();

          // Ensure correct validation errors are present
          for (const field of errorExpectation.invalidFields) {
            expect(body).toHaveProperty(
              ['data', 'errors', field],
              errorExpectation.getExpectedMessages(field)
            );
          }
        }
      }
    );
  });
});
