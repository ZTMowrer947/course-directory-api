/* eslint-disable class-methods-use-this */
// Imports
import { Context, Next } from 'koa';
import logger from 'koa-logger';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

// Middleware
@Middleware({ type: 'before' })
export default class LoggerMiddleware implements KoaMiddlewareInterface {
  async use(context: Context, next: Next): Promise<void> {
    // When not testing,
    if (process.env.NODE_ENV !== 'staging') {
      // Delegate to koa-logger middleware
      await logger()(context, next);
    } else {
      // Otherwise, do nothing
      await next();
    }
  }
}
