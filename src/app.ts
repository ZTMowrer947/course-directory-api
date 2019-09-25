// Imports
import kcors from "kcors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import apiRouter from "./routes";
import baseErrorHandler from "./middleware/baseErrorHandler";
import appErrorHandler from "./middleware/appErrorHandler";
import jsonSerializer from "./middleware/jsonSerializer";
import env from "./env";

// Application setup
const app = new Koa();

// Configuration
if (env === "staging") {
    // Silence log output in testing environment
    app.silent = true;
}

// Middleware
app.use(jsonSerializer);
app.use(baseErrorHandler);
app.use(appErrorHandler);

if (env !== "staging") {
    // Only add logger when not testing
    app.use(logger());
}
app.use(bodyParser());
app.use(kcors());

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Export
export default app;
