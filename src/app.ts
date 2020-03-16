// Imports
import Koa from "koa";
import { useContainer, useKoaServer } from "routing-controllers";
import { Container } from "typedi";

import env from "./env";
import UserController from "./controllers/UserController";
import authorizationChecker from "./functions/authorizationChecker";
import currentUserChecker from "./functions/currentUserChecker";

// Application setup
const app = new Koa();

// Configuration
if (env === "staging") {
    // Silence log output in testing environment
    app.silent = true;
}

// Configure routing-controllers to use TypeDI Container
useContainer(Container);

// Setup routing-controllers
useKoaServer(app, {
    authorizationChecker,
    currentUserChecker,
    cors: true,
    classTransformer: true,
    controllers: [UserController],
});

// Export
export default app;
