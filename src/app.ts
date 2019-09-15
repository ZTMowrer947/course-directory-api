// Imports
import kcors from "kcors";
import Koa from "koa";
import logger from "koa-logger";

// Application setup
const app = new Koa();

// Middleware
app.use(logger());
app.use(kcors());

// Routes

// Export
export default app;
