import { STATUS_CODES } from 'node:http';

import { createError, createRouter, eventHandler } from 'h3';

const users = createRouter();

// GET /api/users: Retrieves authenticated user, or 401's if authentication fails.
users.get(
  '/users',
  eventHandler(() =>
    createError({
      status: 501,
      message: STATUS_CODES[501],
    })
  )
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
