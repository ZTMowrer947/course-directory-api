// Imports
import { Router } from 'express';
import createHttpError from 'http-errors';

// Router setup
const userRoutes = Router();

// Routes
userRoutes
  .route('/') // /api/users V2
  .get((req, res, next) => {
    // Create and throw 503 error
    const error = createHttpError(503);
    next(error);
  })
  .post((req, res, next) => {
    // Create and throw 503 error
    const error = createHttpError(503);
    next(error);
  });

// Exports
export default userRoutes;
