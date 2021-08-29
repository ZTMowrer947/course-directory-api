import { Middleware } from 'koa';
import { ValidationError } from 'yup';
import { MixedSchema } from 'yup/lib/mixed';

function validateBody<TSchema extends MixedSchema>(
  schema: TSchema
): Middleware {
  return async (ctx, next) => {
    try {
      const result = await schema.validate(ctx.request.body, {
        abortEarly: false,
      });

      ctx.request.body = result;

      await next();
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw err;
      }

      ctx.throw(400, err);
    }
  };
}

export default validateBody;
