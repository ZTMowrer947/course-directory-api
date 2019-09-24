// Imports
import { ParameterizedContext } from "koa";
import Router from "koa-router";
import auth from "../middleware/auth";
import AuthState from "../models/AuthState";

// Router setup
const userRouter = new Router();

// Routes
userRouter.get("/", auth, async (ctx: ParameterizedContext<AuthState>) => {
    ctx.body = ctx.state.user;
});

// Export
export default userRouter;
