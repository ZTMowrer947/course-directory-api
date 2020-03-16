// Imports
import { Action, InterceptorInterface } from "routing-controllers";

import Course from "../database/entities/Course.entity";

// Interceptor
export default class CourseInterceptor implements InterceptorInterface {
    intercept(_action: Action, content: unknown): unknown {
        // If content is a course,
        if (content instanceof Course) {
            // Convert to JSON
            return content.toJSON();
        }
        // If content is an array of courses,
        else if (
            Array.isArray(content) &&
            content.every(item => item instanceof Course)
        ) {
            return content.map(item => item.toJSON());
        }
        // Otherwise, leave as-is
        return content;
    }
}
