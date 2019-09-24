// Imports
import { Middleware } from "koa";
import { isJSONSerializable } from "../models/JSONSerializable";

// Middleware
const jsonSerializer: Middleware = async (ctx, next) => {
    // If the context body is JSON-serializable,
    if (isJSONSerializable(ctx.body)) {
        // Serialize it as JSON
        ctx.body = ctx.body.toJSON();
    }

    // Otherwise, leave it unchanged
};

// Export
export default jsonSerializer;
