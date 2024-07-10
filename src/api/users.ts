import { createError, createRouter, eventHandler, setResponseStatus } from 'h3';

import { getUserOrFail } from '~/composables/auth.ts';
import { useCORS } from '~/composables/cors';
import { getDependency } from '~/composables/di.ts';
import readValidatedBody from '~/composables/validate.ts';
import type { AuthedUser } from '~/selects/user.ts';
import { DuplicateEmailError } from '~/services/user';
import { UserInput } from '~/validation/user.ts';

const users = createRouter();

// GET /api/users: Retrieves authenticated user, or 401's if authentication fails.
users.get(
  '/users',
  eventHandler((event) => {
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST'],
      credentials: true,
    });

    if (didHandleCors) return;

    return getUserOrFail(event);
  })
);

// POST /api/users: Creates a new user, 400's if data is invalid.
users.post(
  '/users',
  eventHandler(async (event) => {
    // Handle CORS
    const didHandleCors = useCORS(event, {
      methods: ['GET', 'HEAD', 'POST'],
      credentials: false,
    });

    if (didHandleCors) return;

    // Validate request body
    const userInput = await readValidatedBody(event, UserInput);

    const service = getDependency(event, 'userService');

    let newUser: AuthedUser;

    try {
      // Attempt to create new user
      newUser = await service.create(userInput);
    } catch (err) {
      if (!(err instanceof DuplicateEmailError)) {
        throw err;
      }

      // Handle the case of a duplicated email specially
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failure when processing request data',
        data: {
          errors: {
            emailAddress: ['email address is already in use'],
          },
        },
      });
    }

    // Return 201 result if successful
    setResponseStatus(event, 201, 'Created');

    return newUser;
  })
);

export default users;
