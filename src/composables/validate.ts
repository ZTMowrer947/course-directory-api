import {
  createError,
  type EventHandlerRequest,
  type H3Event,
  readBody,
} from 'h3';
import { assert, type Struct, StructError } from 'superstruct';

export class ValidationError extends Error {
  readonly errors: Record<string, string[]>;

  public constructor(structErr: StructError) {
    super('Validation failure when processing request data');

    const sizeRegex = /`(?<min>\d+)` and /;

    this.errors = structErr
      .failures()
      .reduce((errs: Record<string, string[]>, failure) => {
        const { key, refinement } = failure;
        let message: string;

        switch (refinement) {
          case 'nonempty':
            message = `${key} required but not provided`;
            break;

          case 'email':
            message = `${key} must be a valid email`;
            break;

          case 'size': {
            const result = sizeRegex.exec(failure.message);

            if (result) {
              message = `${key} must have length of at least ${result.groups?.min}`;
            } else {
              message = failure.message;
            }
            break;
          }

          default:
            message = failure.message;
            break;
        }

        return {
          ...errs,
          [key]: [...(errs[key] ?? []), message],
        };
      }, {});
    this.name = 'ValidationError';
  }
}

export function assertDataMatches<T>(
  data: unknown,
  schema: Struct<T>
): asserts data is T {
  try {
    assert(data, schema);
  } catch (err) {
    if (err instanceof StructError) {
      const validationErr = new ValidationError(err);
      validationErr.cause =
        process.env.NODE_ENV !== 'production' ? err : undefined;

      throw validationErr;
    } else {
      throw err;
    }
  }
}

export default async function readValidatedBody<T>(
  event: H3Event<EventHandlerRequest>,
  schema: Struct<T>
): Promise<T> {
  const body = await readBody(event);

  try {
    assertDataMatches(body, schema);
  } catch (err) {
    if (!(err instanceof ValidationError)) throw err;

    throw createError({
      status: 400,
      statusMessage: err.message,
      data: err,
    });
  }

  return body;
}
