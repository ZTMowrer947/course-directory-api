import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import {
  createError,
  createRouter,
  eventHandler,
  getHeader,
  setResponseStatus,
} from 'h3';

import { type AuthedUser, getUserOrFail } from '~/composables/auth.ts';
import { getDependency } from '~/composables/di.ts';
import readValidatedBody from '~/composables/validate.ts';
import { UserInput } from '~/validation/user.ts';

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
    // Validate request body
    const { firstName, lastName, emailAddress, password } =
      await readValidatedBody(event, UserInput);

    const prisma = getDependency(event, 'prisma');

    let newUser: AuthedUser;

    try {
      // Attempt to create new user
      newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          emailAddress,
          password: await argon2.hash(password, {
            parallelism: 4,
            memoryCost: 2 ** 16,
            timeCost: 6,
            type: argon2.argon2id,
          }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          emailAddress: true,
        },
      });
    } catch (err) {
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError) ||
        err.code !== 'P2002'
      ) {
        throw err;
      }

      // Handle the case of a duplicated email specially
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failure when processing request data',
        data: {
          errors: {
            emailAddress: ['Email address is already in use'],
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
