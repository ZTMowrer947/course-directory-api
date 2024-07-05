import { createError, getHeader, H3Event } from 'h3';

import { type AuthedUser } from '~/selects/user.ts';

import { getDependency } from './di.ts';

export async function getUserOrFail(event: H3Event): Promise<AuthedUser> {
  const service = getDependency(event, 'userService');
  const header = getHeader(event, 'Authorization') ?? '';

  const user = await service.getUserFromCredentials(header);

  if (!user) {
    throw createError({
      status: 401,
      statusMessage: 'Incorrect or invalid credentials',
    });
  } else {
    return user;
  }
}
