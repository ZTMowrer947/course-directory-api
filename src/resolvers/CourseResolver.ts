// Imports
import { Service } from "typedi";
import { Resolver, Query, Args, Arg } from "type-graphql";
import Course from "../database/entities/Course.entity";
import CourseService from "../services/Course.service";
import CourseArgs from "../models/CourseArgs";

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

        if (!course) throw new Error(`Course not found with ID "${id}".`);
        return course;
    }
}
