import Router from '@koa/router';
import argon2 from 'argon2';
import os from 'os';
import { ValidationError } from 'yup';

import auth, { AuthState } from '../middleware/auth';
import prismaMiddleware, { PrismaState } from '../middleware/prisma';
import validateBody from '../middleware/validate-body';
import UserSchema, { UserInput } from '../validation/user';

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  parallelism: os.cpus().length,
  timeCost: 10,
};

const userRouter = new Router<PrismaState & AuthState>({
  prefix: '/api/users',
});

userRouter.get('/', prismaMiddleware, auth, (ctx) => {
  ctx.body = ctx.state.user;
});

userRouter.post(
  '/',
  validateBody(UserSchema),
  prismaMiddleware,
  async (ctx, next) => {
    const body = ctx.request.body as UserInput;

    const existingUser = await ctx.state.prisma.user.findUnique({
      where: {
        emailAddress: body.emailAddress,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      ctx.throw(
        400,
        new ValidationError('email already in use', body, 'emailAddress')
      );
      return;
    }

    await next();
  },
  async (ctx) => {
    const newUser = ctx.request.body as UserInput;

    const hashedPassword = await argon2.hash(newUser.password, hashOptions);

    const createdUser = await ctx.state.prisma.user.create({
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailAddress: newUser.emailAddress,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
      },
    });

    ctx.status = 201;
    ctx.body = createdUser;
  }
);

export default userRouter;
