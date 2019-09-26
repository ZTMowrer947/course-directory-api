// Imports
import Router from "koa-router";
import courseRouter from "./courses";
import userRouter from "./users";

// Router setup
const apiRouter = new Router({
    prefix: "/api",
});

// Routes
apiRouter.use("/users", userRouter.routes());
apiRouter.use("/courses", courseRouter.routes());

// Export
export default apiRouter;
