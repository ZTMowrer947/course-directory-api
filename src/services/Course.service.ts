// Imports
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Course from "../database/entities/Course.entity";
import AppError from "../models/AppError";

// Service
@Service()
export default class CourseService {
    private repository: Repository<Course>;

    public constructor(
        @InjectRepository(Course) repository: Repository<Course>
    ) {
        this.repository = repository;
    }

    public async getList(): Promise<Course[]> {
        // Create query
        const query = this.repository
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.creator", "user");

        // Execute query and get results
        const courses = await query.getMany();

        // Return results
        return courses;
    }

    public async getCourseById(id: string): Promise<Course> {
        // Create query
        const query = this.repository
            .createQueryBuilder("course")
            .where("course.id = :id", { id })
            .leftJoinAndSelect("course.creator", "user");

        // Execute query and get result
        const course = await query.getOne();

        // If the course was not found,
        if (!course) {
            // Throw a 404 error
            throw new AppError(`Course not found with ID "${id}".`);
        }

        // Otherwise, return result
        return course;
    }
}
