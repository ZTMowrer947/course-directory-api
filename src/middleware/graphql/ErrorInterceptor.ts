// Imports
import { GraphQLError } from "graphql";
import { MiddlewareFn } from "type-graphql";
import GraphQLContext from "../../models/GraphQLContext";
import AppError from "../../models/AppError";

// Middleware
const ErrorInterceptor: MiddlewareFn<GraphQLContext> = async (_, next) => {
    try {
        // Process rest of middleware chain
        return await next();
    } catch (error) {
        // If an error was thrown,

        // If it was not an AppError or GraphQLError,
        if (!(error instanceof AppError) && !(error instanceof GraphQLError)) {
            // Throw an Internal Server AppError
            throw new AppError("An unknown error occurred on the server.", 500);
        }

        // Otherwise, just rethrow the error
        throw error;
    }
};

// Export
export default ErrorInterceptor;
