// Imports
import { Middleware } from "koa";
import AppError from "../models/AppError";

// Middleware
const appErrorHandler: Middleware = async (ctx, next) => {
    try {
        // Continue middleware stack
        await next();
    } catch (error) {
        // If an error is thrown,

        // and if it is an AppError,
        if (error instanceof AppError) {
            // Set status according to status property
            ctx.status = error.status;

            // Set response body to error body
            ctx.body = error;
        } else {
            // Otherwise, rethrow error
            throw error;
        }
    }
};

// Export
export default appErrorHandler;
