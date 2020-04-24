// Imports
import { createKoaServer, useContainer } from "routing-controllers";
import { Container } from "typedi";

import CourseController from "./controllers/CourseController";
import UserController from "./controllers/UserController";
import env from "./env";
import authorizationChecker from "./functions/authorizationChecker";
import currentUserChecker from "./functions/currentUserChecker";
import LoggerMiddleware from "./middleware/LoggerMiddleware";
import JsonInterceptor from "./interceptors/JsonInterceptor";

// Configure routing-controllers to use TypeDI Container
useContainer(Container);

// Create Koa application
const app = createKoaServer({
    authorizationChecker,
    currentUserChecker,
    cors: {
        exposeHeaders: ["Location"],
    },
    classTransformer: true,
    controllers: [CourseController, UserController],
    middlewares: [LoggerMiddleware],
    interceptors: [JsonInterceptor],
});

// Silence app if testing
app.silent = env === "staging";

// Export
export default app;
