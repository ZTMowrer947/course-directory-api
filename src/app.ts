// Imports
import kcors from "kcors";
import Koa from "koa";
import logger from "koa-logger";
import apiRouter from "./routes";
import baseErrorHandler from "./middleware/baseErrorHandler";
import appErrorHandler from "./middleware/appErrorHandler";
import jsonSerializer from "./middleware/jsonSerializer";

// Application setup
const app = new Koa();

// Middleware
app.use(jsonSerializer);
app.use(baseErrorHandler);
app.use(appErrorHandler);
app.use(logger());
app.use(kcors());

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Export
export default app;
