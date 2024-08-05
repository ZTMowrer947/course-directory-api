import {
  createError,
  type EventHandlerRequest,
  type H3Event,
  readValidatedBody,
} from 'h3';
import { create, type Struct, StructError } from 'superstruct';

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

function validateInput<T>(data: unknown, struct: Struct<T>): T {
  try {
    // Coerce data into struct format
    return create(data, struct);
  } catch (err) {
    // Rethrow any non-validation error
    if (!(err instanceof StructError)) throw err;

    // Create and throw ValidationError
    const validationErr = new ValidationError(err);
    validationErr.cause =
      process.env.NODE_ENV !== 'production' ? err : undefined;

    throw validationErr;
  }
}

export default async function readSuperstructValidatedBody<T>(
  event: H3Event<EventHandlerRequest>,
  struct: Struct<T>
): Promise<T> {
  let body: T;

  try {
    body = await readValidatedBody(event, (input) =>
      validateInput(input, struct)
    );
  } catch (err) {
    if (!(err instanceof ValidationError)) throw err;

    throw createError({
      status: 400,
      data: err,
    });
  }

  return body;
}
