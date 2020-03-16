// Imports
import { Action, InterceptorInterface } from "routing-controllers";

import User from "../database/entities/User.entity";

// Interceptor
export default class UserInterceptor implements InterceptorInterface {
    intercept(_action: Action, content: unknown): unknown {
        // If content is a user,
        if (content instanceof User) {
            // Convert to JSON
            return content.toJSON();
        }

        // Otherwise, leave as-is
        return content;
    }
}
