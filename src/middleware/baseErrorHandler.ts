// Imports
import { Middleware } from "koa";
import env from "../env";

// Middleware
const baseErrorHandler: Middleware = async (ctx, next) => {
    try {
        // Continue middleware stack
        await next();
    } catch (error) {
        // If an error is thrown,

        // And if the status code is not in the error status (400-500) range,
        if (ctx.status < 400 || ctx.status > 599) {
            // Set status to 500
            ctx.status = 500;
        }

        // Set response body to error message with stack trace
        ctx.body = {
            message: error.message,
            stack: env !== "production" ? error.stack : undefined,
        };
    }
};

// Export
export default baseErrorHandler;
