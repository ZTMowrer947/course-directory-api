// Imports
import express from 'express';
import { useExpressServer } from 'routing-controllers';

import CourseController from '@/controllers/CourseController';
import UserController from '@/controllers/UserController';
import LoggerMiddleware from '@/middleware/LoggerMiddleware';
import authorizationChecker from '@/utils/auth/authorizationChecker';
import currentUserChecker from '@/utils/auth/currentUserChecker';

// Create Express application
const app = express();

// Configuration
app.disable('x-powered-by');

useExpressServer(app, {
  authorizationChecker,
  currentUserChecker,
  cors: {
    exposeHeaders: ['Location'],
  },
  classTransformer: true,
  controllers: [CourseController, UserController],
  middlewares: [LoggerMiddleware],
});

// Export
export default app;
