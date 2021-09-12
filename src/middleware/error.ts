import { STATUS_CODES } from 'http';
import createHttpError, { HttpError, isHttpError } from 'http-errors';
import { Middleware } from 'koa';

/**
 * A simple HTTP error handler that clearly responds to the client with
 * JSON data describing the error, unless said error is to remain
 * unexposed.
 */
const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const httpError = err as HttpError;

    ctx.status = httpError.status;

    ctx.app.emit('error', httpError);

    if (
      httpError.expose ||
      (httpError.status < 500 && httpError.status >= 400)
    ) {
      ctx.body = httpError;
    } else {
      ctx.body = {
        message: STATUS_CODES[httpError.status],
      };
    }
  }
};

/**
 * Coerces any type of error into an HTTP error if it is not one already.
 */
const errorNormalizer: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const httpError = isHttpError(err) ? err : createHttpError(500, err);

    throw httpError;
  }
};

export { errorHandler, errorNormalizer };
