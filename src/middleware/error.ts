import { STATUS_CODES } from 'http';
import createHttpError, { HttpError, isHttpError } from 'http-errors';
import { Middleware } from 'koa';

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

const errorNormalizer: Middleware = async (_ctx, next) => {
  try {
    await next();
  } catch (err) {
    const httpError = isHttpError(err) ? err : createHttpError(500, err);

    throw httpError;
  }
};

export { errorHandler, errorNormalizer };
