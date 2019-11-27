// Imports
import { Service } from "typedi";
import {
    Arg,
    Args,
    Authorized,
    Ctx,
    Mutation,
    Query,
    Resolver,
} from "type-graphql";
import Course from "../database/entities/Course.entity";
import User from "../database/entities/User.entity";
import CourseService from "../services/Course.service";
import CourseArgs from "../models/CourseArgs";
import CourseInput from "../models/CourseInput";
import AppError from "../models/AppError";

// Resolver
@Service()
@Resolver(() => Course)
export default class CourseResolver {
    private courseService: CourseService;

    public constructor(courseService: CourseService) {
        this.courseService = courseService;
    }

    @Query(() => [Course])
    public async courses(): Promise<Course[]> {
        return this.courseService.getList();
    }

    @Query(() => Course)
    public async course(@Args() args: CourseArgs): Promise<Course> {
        const { id } = args;
        const course = await this.courseService.getCourseById(id);

        if (!course)
            throw new AppError(`Course not found with ID "${id}".`, 404);
        return course;
    }

    @Authorized()
    @Mutation(() => String)
    public async newCourse(
        @Ctx("user") user: User,
        @Arg("courseInput") courseInput: CourseInput
    ): Promise<string> {
        return this.courseService.create(user, courseInput);
    }

    @Authorized()
    @Mutation(() => Boolean)
    public async updateCourse(
        @Ctx("user") user: User,
        @Args() args: CourseArgs,
        @Arg("courseInput") courseInput: CourseInput
    ): Promise<boolean> {
        const { id } = args;
        const course = await this.courseService.getCourseById(id);

        if (!course)
            throw new AppError(`Course not found with ID "${id}".`, 404);

        if (course.creator.id !== user.id)
            throw new AppError(
                "You are not allowed to modify this resource.",
                403
            );

        await this.courseService.update(course, courseInput);

        return true;
    }

    @Authorized()
    @Mutation(() => Boolean)
    public async deleteCourse(
        @Ctx("user") user: User,
        @Args() args: CourseArgs
    ): Promise<boolean> {
        const { id } = args;
        const course = await this.courseService.getCourseById(id);

        if (!course)
            throw new AppError(`Course not found with ID "${id}".`, 404);

        if (course.creator.id !== user.id)
            throw new AppError(
                "You are not allowed to modify this resource.",
                403
            );

        await this.courseService.delete(course);

        return true;
    }
}
