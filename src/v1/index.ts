// Imports
import Koa from 'koa';
import { createKoaServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import UserController from './controllers/user';
import LoggerMiddleware from './middleware/logger';
import { authorizationChecker, currentUserChecker } from './utils/auth';

// Setup TypeDI container
useContainer(Container);

// Create Koa application
const v1Api = createKoaServer({
  authorizationChecker,
  cors: {
    exposeHeaders: ['Location'],
  },
  classTransformer: true,
  currentUserChecker,
  controllers: [UserController],
  middlewares: [LoggerMiddleware],
}) as Koa;

// Silence app if testing
v1Api.silent = process.env.NODE_ENV === 'staging';

// Export
export default v1Api.callback();
