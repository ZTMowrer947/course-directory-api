// Imports
import { Middleware } from "koa";
import { isJSONSerializable } from "../models/JSONSerializable";

// Middleware
const jsonSerializer: Middleware = async (ctx, next) => {
    // Proceed with middleware chain
    await next();

    // If the context body is defined,
    if (ctx.body) {
        // If the context body is an array, and all elements are JSON-Serializable
        if (
            Array.isArray(ctx.body) &&
            ctx.body.every(item => isJSONSerializable(item))
        ) {
            // Map all items into JSON
            ctx.body = ctx.body.map(item => item.toJSON());
        } else if (isJSONSerializable(ctx.body)) {
            // Otherwise, if the body is JSON-Serializable,

            // Serialize it as JSON
            ctx.body = ctx.body.toJSON();
        }
    }

    // Otherwise, leave it unchanged
};

// Export
export default jsonSerializer;
