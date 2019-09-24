// Imports
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ParameterizedContext } from "koa";
import Router from "koa-router";
import { Container } from "typedi";
import auth from "../middleware/auth";
import AuthState from "../models/AuthState";
import UserState from "../models/UserState";
import UserService from "../services/User.service";
import UserModifyDTO from "../models/UserModifyDTO";
import InvalidRequestError from "../models/InvalidRequestError";

// Router setup
const userRouter = new Router();

// Middleware
userRouter.use(async (ctx: ParameterizedContext<UserState>, next) => {
    ctx.state.userService = Container.get(UserService);

    await next();
});

// Routes
userRouter.get("/", auth, async (ctx: ParameterizedContext<AuthState>) => {
    ctx.body = ctx.state.user;
});

userRouter.post("/", async (ctx: ParameterizedContext<UserState>) => {
    // Transform request body into UserModifyDTO
    const userData = plainToClass(UserModifyDTO, ctx.request.body, {
        excludeExtraneousValues: true,
    });

    // Validate user data
    const errors = await validate(userData);

    // If errors were found, throw validation error
    if (errors.length > 0) {
        throw new InvalidRequestError(errors);
    }

    // Otherwise, create user
    await ctx.state.userService.create(userData);

    // Get base URL
    const baseURL = `${ctx.request.protocol}://${ctx.request.host}`;

    // Set Location header
    ctx.set("Location", `${baseURL}/api/users`);

    // Set status to 201
    ctx.status = 201;
});

// Export
export default userRouter;
