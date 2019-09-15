// Imports
import kcors from "kcors";
import Koa from "koa";
import logger from "koa-logger";
import apiRouter from "./routes";

// Application setup
const app = new Koa();

// Middleware
app.use(logger());
app.use(kcors());

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Export
export default app;
