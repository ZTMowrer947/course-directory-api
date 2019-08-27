// Imports
import express from "express";
import morgan from "morgan";
import {
    useContainer as routingUseContainer,
    useExpressServer,
} from "routing-controllers";
import { Container } from "typedi";
import { useContainer as ormUseContainer } from "typeorm";
import authChecker from "./authChecker";
import UserController from "./controllers/User.controller";
import currentUserChecker from "./currentUserChecker";
import env from "./env";

// Container setup
routingUseContainer(Container);
ormUseContainer(Container);

// Express app setup
const app = express();

// Middleware
if (env !== "staging") {
    app.use(morgan("dev")); // Log HTTP requests if not doing testing
}

// Controller setup
useExpressServer(app, {
    controllers: [UserController],
    classTransformer: true,
    routePrefix: "/api",
    validation: true,
    authorizationChecker: authChecker,
    currentUserChecker,
});

// Set port to listen on
app.set("port", process.env.PORT || 5000);

// Export
export default app;
