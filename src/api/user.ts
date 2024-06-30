import { STATUS_CODES } from 'node:http';

import { createError, createRouter, eventHandler, getHeader } from 'h3';

import { getUserOrFail } from '~/composables/auth';

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
  eventHandler(() =>
    createError({
      status: 501,
      message: STATUS_CODES[501],
    })
  )
);

export default users;
