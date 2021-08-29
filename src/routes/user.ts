import Router from '@koa/router';

import auth, { AuthState } from '../middleware/auth';
import prismaMiddleware, { PrismaState } from '../middleware/prisma';

const userRouter = new Router<PrismaState & AuthState>({
  prefix: '/api/users',
});

userRouter.get('/', prismaMiddleware, auth, (ctx) => {
  ctx.body = ctx.state.user;
});

export default userRouter;
