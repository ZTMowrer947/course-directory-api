// Imports
import { ApolloServer } from "apollo-server-koa";
import kcors from "kcors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { Container } from "typedi";
import { buildSchema } from "type-graphql";
import authChecker from "./authChecker";
import apiRouter from "./routes";
import baseErrorHandler from "./middleware/baseErrorHandler";
import appErrorHandler from "./middleware/appErrorHandler";
import jsonSerializer from "./middleware/jsonSerializer";
import env from "./env";
import CourseResolver from "./resolvers/CourseResolver";
import UserResolver from "./resolvers/UserResolver";

// Application setup
const app = new Koa();

// Configuration
if (env === "staging") {
    // Silence log output in testing environment
    app.silent = true;
}

(async () => {
    // GraphQL schema setup
    const schema = await buildSchema({
        authChecker,
        resolvers: [CourseResolver, UserResolver],
        container: Container,
    });

    // Apollo server setup
    const server = new ApolloServer({
        schema,
        context: ({ ctx }) => {
            return { koaCtx: ctx };
        },
    });

    // Middleware
    app.use(async (ctx, next) => {
        if (!ctx.path.startsWith(server.graphqlPath)) {
            await jsonSerializer(ctx, next);
        } else {
            await next();
        }
    });
    app.use(baseErrorHandler);
    app.use(appErrorHandler);

    if (env !== "staging") {
        // Only add logger when not testing
        app.use(logger());
    }
    app.use(bodyParser());
    app.use(
        kcors({
            exposeHeaders: ["Location"],
        })
    );

    // Routes
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());

    // Attach GraphQL server to koa app
    app.use(server.getMiddleware({ path: "/gql" }));
})();

// Export
export default app;
