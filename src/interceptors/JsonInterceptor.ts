// Imports
import { Action, InterceptorInterface, Interceptor } from 'routing-controllers';
import { Context } from 'koa';
import { isJSONSerializable } from '@/models/JSONSerializable';

// Interceptor
@Interceptor()
export default class JsonInterceptor implements InterceptorInterface {
  intercept(action: Action, result: unknown): unknown {
    // Get Koa context from action
    const ctx = action.context as Context;

    // If the result is not empty, and the client accepts JSON,
    if (result && ctx.accepts('json')) {
      // If the result is an array with JSON-serializable items,
      if (Array.isArray(result) && result.every(isJSONSerializable)) {
        // Return array with all items serialized
        return result.map((item) => item.toJSON());
      }

      // If the result itself is JSON-serializable
      if (isJSONSerializable(result)) {
        // Return its serialized version
        return result.toJSON();
      }
    }

    // Otherwise, return content as-is
    return result;
  }
}
