import { User } from '@prisma/client';
import argon2 from 'argon2';
import basicAuth from 'basic-auth';
import { Middleware } from 'koa';

import { PrismaState } from './prisma';

interface AuthState {
  /**
   * The user who has been authenticated for this request.
   */
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'emailAddress'>;
}

/**
 * Attempts to authenticate the current request via basic authentication.
 *
 * @throws 401 if authorization credentials are not found or are invalid
 */
const auth: Middleware<AuthState & PrismaState> = async (ctx, next) => {
  const credentials = basicAuth(ctx.req);

  if (!credentials) {
    ctx.throw(401, 'no authorization provided for private route');
    return;
  }

  const result = await ctx.state.prisma.user.findUnique({
    where: {
      emailAddress: credentials.name,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      emailAddress: true,
      password: true,
    },
  });

  if (!result || !(await argon2.verify(result.password, credentials.pass))) {
    ctx.throw(401, 'incorrect email/password combination');
    return;
  }

  const { password, ...user } = result;

  ctx.state.user = user;

  await next();
};

export type { AuthState };
export default auth;