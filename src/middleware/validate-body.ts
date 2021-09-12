import { Middleware } from 'koa';
import { ValidationError } from 'yup';
import { MixedSchema } from 'yup/lib/mixed';

/**
 * Validates the request body according to the provided schema.
 * @param schema The schema to validate the body with
 * @throws 400 if the request body fails to match the schema
 */
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
