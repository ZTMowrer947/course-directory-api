// Imports
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ParameterizedContext, Middleware } from "koa";
import Router from "koa-router";
import { Container } from "typedi";
import CourseState from "../models/CourseState";
import CourseService from "../services/Course.service";
import CourseByIdState from "../models/CourseByIdState";
import AuthState from "../models/AuthState";
import auth from "../middleware/auth";
import CourseModifyDTO from "../models/CourseModifyDTO";
import InvalidRequestError from "../models/InvalidRequestError";
import AppError from "../models/AppError";

// Router setup
const courseRouter = new Router();

// Middleware
courseRouter.use(async (ctx: ParameterizedContext<CourseState>, next) => {
    // Attach CourseService to context state
    ctx.state.courseService = Container.get(CourseService);

    // Continue middleware flow
    await next();
});

const courseById: Middleware<CourseByIdState, Router.IRouterContext> = async (
    ctx,
    next
) => {
    // Find course by ID and attach to context state
    ctx.state.course = await ctx.state.courseService.getCourseById(
        ctx.params.id
    );

    // Continue middleware flow
    await next();
};

// Routes
courseRouter.get("/", async (ctx: ParameterizedContext<CourseState>) => {
    // Get course listing
    ctx.body = await ctx.state.courseService.getList();
});

courseRouter.post(
    "/",
    auth,
    async (ctx: ParameterizedContext<CourseState & AuthState>) => {
        // Transform request body into CourseModifyDTO
        const courseData = plainToClass(CourseModifyDTO, ctx.request.body, {
            excludeExtraneousValues: true,
        });

        // Validate course data
        const errors = await validate(courseData);

        // If errors were found, throw validation error
        if (errors.length > 0) {
            throw new InvalidRequestError(errors);
        }

        // Create course and get ID
        const id = await ctx.state.courseService.create(
            ctx.state.user,
            courseData
        );

        // Get base URL
        const baseURL = `${ctx.request.protocol}://${ctx.request.host}`;

        // Set Location header
        ctx.set("Location", `${baseURL}/api/courses/${id}`);

        // Set status to 201
        ctx.status = 201;
    }
);

courseRouter.get(
    "/:id",
    courseById,
    async (ctx: ParameterizedContext<CourseByIdState>) => {
        // Response with course found by ID
        ctx.body = ctx.state.course;
    }
);

courseRouter.put(
    "/:id",
    auth,
    courseById,
    async (ctx: ParameterizedContext<CourseByIdState & AuthState>) => {
        // If course does not belong to authenticated user,
        if (ctx.state.course.creator.id !== ctx.state.user.id) {
            // Throw 403 error
            throw new AppError(
                "You are not allowed to modify this resource.",
                403
            );
        }

        // Otherwise, ransform request body into CourseModifyDTO
        const updateData = plainToClass(CourseModifyDTO, ctx.request.body, {
            excludeExtraneousValues: true,
        });

        // Validate course data
        const errors = await validate(updateData);

        // If errors were found, throw validation error
        if (errors.length > 0) {
            throw new InvalidRequestError(errors);
        }

        // Otherwise, update course
        await ctx.state.courseService.update(ctx.state.course, updateData);

        // Set status to 204
        ctx.status = 204;
    }
);

courseRouter.delete(
    "/:id",
    auth,
    courseById,
    async (ctx: ParameterizedContext<CourseByIdState & AuthState>) => {
        // If course does not belong to authenticated user,
        if (ctx.state.course.creator.id !== ctx.state.user.id) {
            // Throw 403 error
            throw new AppError(
                "You are not allowed to modify this resource.",
                403
            );
        }

        // Otherwise, delete course
        await ctx.state.courseService.delete(ctx.state.course);

        // Set status to 204
        ctx.status = 204;
    }
);

// Export
export default courseRouter;
