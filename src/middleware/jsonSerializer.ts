// Imports
import { Middleware } from "koa";
import { isJSONSerializable } from "../models/JSONSerializable";

// Middleware
const jsonSerializer: Middleware = async (ctx, next) => {
    // Proceed with middleware chain
    await next();

    // If the context body is defined and is JSON-serializable,
    if (ctx.body && isJSONSerializable(ctx.body)) {
        // Serialize it as JSON
        ctx.body = ctx.body.toJSON();
    }

    // Otherwise, leave it unchanged
};

// Export
export default jsonSerializer;
