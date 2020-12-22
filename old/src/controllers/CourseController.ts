// Imports
import { Context } from "koa";
import {
    Authorized,
    Body,
    Ctx,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    JsonController,
    NotFoundError,
    OnUndefined,
    Param,
    Post,
    Put,
} from "routing-controllers";

import Course from "../database/entities/Course";
import User from "../database/entities/User";
import CourseModifyDTO from "../models/CourseModifyDTO";
import CourseService from "../services/CourseService";

// Controller
@JsonController("/api/courses")
export default class CourseController {
    private courseService: CourseService;

    constructor(courseService: CourseService) {
        this.courseService = courseService;
    }

    @Get("/")
    async getList(): Promise<Course[]> {
        return this.courseService.getList();
    }

    @Get("/:id")
    async get(@Param("id") id: string): Promise<Course | undefined> {
        return this.courseService.getCourseById(id);
    }

    @Authorized()
    @Post("/")
    @OnUndefined(201)
    async post(
        @Ctx() ctx: Context,
        @CurrentUser({ required: true }) user: User,
        @Body() courseData: CourseModifyDTO
    ): Promise<void> {
        // Create course and get ID
        const id = await this.courseService.create(user, courseData);

        // Get base URL
        const baseURL = `${ctx.request.protocol}://${ctx.request.host}`;

        // Set Location header
        ctx.set("Location", `${baseURL}/api/courses/${id}`);
    }

    @Authorized()
    @Put("/:id")
    @OnUndefined(204)
    async put(
        @Param("id") id: string,
        @CurrentUser({ required: true }) user: User,
        @Body() updateData: CourseModifyDTO
    ): Promise<void> {
        // Get course by ID
        const course = await this.courseService.getCourseById(id);

        // If course was not found, throw 404 error
        if (!course) throw new NotFoundError("Course data not found.");

        // If current user does not own course, throw 403 error
        if (user.id !== course.creator.id)
            throw new ForbiddenError(
                "Only the owner of a course may modify it."
            );

        // Otherwise, update course
        await this.courseService.update(course, updateData);
    }

    @Authorized()
    @Delete("/:id")
    @OnUndefined(204)
    async delete(
        @Param("id") id: string,
        @CurrentUser({ required: true }) user: User
    ): Promise<void> {
        // Get course by ID
        const course = await this.courseService.getCourseById(id);

        // If course was not found, throw 404 error
        if (!course) throw new NotFoundError("Course data not found.");

        // If current user does not own course, throw 403 error
        if (user.id !== course.creator.id)
            throw new ForbiddenError(
                "Only the owner of a course may modify it."
            );

        // Otherwise, delete course
        await this.courseService.delete(course);
    }
}
