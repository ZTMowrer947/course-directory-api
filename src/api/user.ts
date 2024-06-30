import { STATUS_CODES } from 'node:http';

import { createError, createRouter, eventHandler, getHeader } from 'h3';

import { getUserOrFail } from '~/composables/auth';
import readValidatedBody from '~/composables/validate';
import { UserInput } from '~/validation/user';

const users = createRouter();

// GET /api/users: Retrieves authenticated user, or 401's if authentication fails.
users.get(
  '/users',
  eventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization') ?? '';

    return getUserOrFail(authHeader);
  })
);

// POST /api/users: Creates a new user, 400's if data is invalid.
users.post(
  '/users',
  eventHandler(async (event) => {
    const userData = await readValidatedBody(event, UserInput);

    console.log(userData);

    throw createError({
      status: 501,
      message: STATUS_CODES[501],
    });
  })
);

export default users;
