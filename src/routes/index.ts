// Imports
import Router from "koa-router";
import userRouter from "./users";

// Router setup
const apiRouter = new Router({
    prefix: "/api",
});

// Routes
apiRouter.use("/users", userRouter.routes());

// Export
export default apiRouter;
