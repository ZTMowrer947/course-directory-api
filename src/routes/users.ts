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
import UserInput from "../models/UserInput";
import InvalidRequestError from "../models/InvalidRequestError";
import AppError from "../models/AppError";

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
    // Transform request body into UserInput
    const userData = plainToClass(UserInput, ctx.request.body, {
        excludeExtraneousValues: true,
    });

    // Validate user data
    const errors = await validate(userData);

    // If errors were found, throw validation error
    if (errors.length > 0) {
        throw new InvalidRequestError(errors);
    }

    // Otherwise, check if email address is already in use
    const existingUser = await ctx.state.userService.getUserByEmail(
        userData.emailAddress
    );

    // If user was found, throw 400 error
    if (existingUser) {
        throw new AppError(
            "Email address is already in use by another user.",
            400
        );
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
