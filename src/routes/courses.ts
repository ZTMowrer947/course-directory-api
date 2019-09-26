// Imports
import { ParameterizedContext } from "koa";
import Router from "koa-router";
import { Container } from "typedi";
import CourseState from "../models/CourseState";
import CourseService from "../services/Course.service";
import CourseByIdState from "../models/CourseByIdState";

// Router setup
const courseRouter = new Router();

// Middleware
courseRouter.use(async (ctx: ParameterizedContext<CourseState>, next) => {
    // Attach CourseService to context state
    ctx.state.courseService = Container.get(CourseService);

    // Continue middleware flow
    await next();
});

// Param handlers
courseRouter.param(
    "id",
    async (id, ctx: ParameterizedContext<CourseByIdState>, next) => {
        // Find course by ID and attach to context state
        ctx.state.course = await ctx.state.courseService.getCourseById(id);

        // Continue middleware flow
        await next();
    }
);

// Routes
courseRouter.get("/", async (ctx: ParameterizedContext<CourseState>) => {
    // Get course listing
    ctx.body = await ctx.state.courseService.getList();
});

courseRouter.get("/:id", async (ctx: ParameterizedContext<CourseByIdState>) => {
    // Response with course found by ID
    ctx.body = ctx.state.course;
});

// Export
export default courseRouter;
