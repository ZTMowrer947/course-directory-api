// Imports
import Koa from 'koa';
import { createKoaServer } from 'routing-controllers';

import CourseController from '@/controllers/CourseController';
import UserController from '@/controllers/UserController';
import env from '@/env';
import authorizationChecker from '@/functions/authorizationChecker';
import currentUserChecker from '@/functions/currentUserChecker';
import JsonInterceptor from '@/interceptors/JsonInterceptor';
import LoggerMiddleware from '@/middleware/LoggerMiddleware';

// Create Koa application
const app = createKoaServer({
  authorizationChecker,
  currentUserChecker,
  cors: {
    exposeHeaders: ['Location'],
  },
  classTransformer: true,
  controllers: [CourseController, UserController],
  middlewares: [LoggerMiddleware],
  interceptors: [JsonInterceptor],
}) as Koa;

// Silence app if testing
app.silent = env === 'staging';

// Export
export default app;
