import { asClass,asFunction, type AwilixContainer } from 'awilix';
import { toWebHandler,type WebHandler } from 'h3';
import {
  dropTestDb,
  generateTestDbUrl,
  initTestDb,
  makeTestPrismaClient,
  truncateTables,
} from 'tests/db.ts';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import initApp from '~/app.ts';
import { container,type FullDeps } from '~/container.ts';
import { CourseService } from '~/services/course.ts';
import { UserService } from '~/services/user.ts';
import type { UserInputData } from '~/validation/user';

import { endpoint } from './utils';

interface ErrorExpectation {
  invalidFields: (keyof UserInputData)[];
  getExpectedMessages(key: keyof UserInputData): string[];
}

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

  test('POST /api/users yields 400 for input with empty fields', async () => {
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

    const emptyInput = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      password: '',
    } satisfies UserInputData;

    // Define expectations for inputs
    const emptyErrors = {
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
    } satisfies ErrorExpectation;

    // Make request
    const emptyRes = await handler(new Request(url, getReqOptions(emptyInput)));

    // Expect JSON response with 400 status
    expect(emptyRes.status).toBe(400);
    expect(emptyRes.headers.get('Content-Type')).toBe('application/json');
    const emptyResBody = await emptyRes.json();

    // Ensure correct validation errors are present
    for (const field of emptyErrors.invalidFields) {
      expect(emptyResBody).toHaveProperty(
        ['data', 'errors', field],
        emptyErrors.getExpectedMessages(field)
      );
    }
  });
});
