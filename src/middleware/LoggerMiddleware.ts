// Imports
import { Context, Next } from 'koa';
import logger from 'koa-logger';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';
import env from '../env';

// Middleware
@Middleware({ type: 'before' })
export default class LoggerMiddleware implements KoaMiddlewareInterface {
  async use(context: Context, next: Next): Promise<void> {
    // When not testing,
    if (env !== 'staging') {
      // Delegate to koa-logger middleware
      await logger()(context, next);
    }

    // Otherwise, do nothing
    await next();
  }
}
