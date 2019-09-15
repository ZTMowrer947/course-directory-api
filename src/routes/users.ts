// Imports
import Router from "koa-router";

// Router setup
const userRouter = new Router();

// Routes
userRouter.get("/", ctx => {
    ctx.body = { message: "User endpoint" };
});

// Export
export default userRouter;
