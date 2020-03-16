// Imports
import Koa from "koa";
import logger from "koa-logger";
import { useContainer, useKoaServer } from "routing-controllers";
import { Container } from "typedi";

import env from "./env";
import CourseController from "./controllers/CourseController";
import UserController from "./controllers/UserController";
import authorizationChecker from "./functions/authorizationChecker";
import currentUserChecker from "./functions/currentUserChecker";

// Application setup
const app = new Koa();

// Configuration
// In testing environments,
if (env === "staging") {
    // Silence log output
    app.silent = true;
}
// In all other environments,
else {
    // Add logger middleware
    app.use(logger());
}

// Configure routing-controllers to use TypeDI Container
useContainer(Container);

// Setup routing-controllers
useKoaServer(app, {
    authorizationChecker,
    currentUserChecker,
    cors: true,
    classTransformer: true,
    controllers: [CourseController, UserController],
});

// Export
export default app;
