/* eslint-disable @typescript-eslint/no-explicit-any */
// Imports
import { Interceptor, InterceptorInterface, Action } from "routing-controllers";
import { isJSONSerializable } from "../models/JSONSerializable";

// Interceptor
@Interceptor()
export default class SerializeInterceptor implements InterceptorInterface {
    public intercept(action: Action, result: any): any {
        // If current result is JSON-serializable,
        if (isJSONSerializable(result)) {
            // Return its serialized version
            return result.toJSON();
        }

        // Otherwise, return the result as-is
        return result;
    }
}
