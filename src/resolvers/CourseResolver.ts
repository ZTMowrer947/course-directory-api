// Imports
import { Service } from "typedi";
import { Resolver, Query } from "type-graphql";
import Course from "../database/entities/Course.entity";
import CourseService from "../services/Course.service";

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
}
