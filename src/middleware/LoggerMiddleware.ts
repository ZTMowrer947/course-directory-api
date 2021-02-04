// Imports
import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

import env from '@/env';

// Middleware
@Middleware({ type: 'before' })
export default class LoggerMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): void {
    // When not testing,
    if (env !== 'staging') {
      // Delegate to morgan middleware
      morgan(env === 'production' ? 'combined' : 'dev')(req, res, next);
    } else {
      // Otherwise, do nothing
      next();
    }
  }
}
