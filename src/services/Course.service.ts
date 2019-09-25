// Imports
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Course from "../database/entities/Course.entity";
import AppError from "../models/AppError";
import User from "../database/entities/User.entity";
import CourseModifyDTO from "../models/CourseModifyDTO";

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

    public async create(
        user: User,
        courseData: CourseModifyDTO
    ): Promise<void> {
        // Create course instance
        const course = new Course();

        // Set course properties
        course.title = courseData.title;
        course.description = courseData.description;
        course.estimatedTime = courseData.estimatedTime || null;
        course.materialsNeeded = courseData.materialsNeeded || null;

        // Attach user to course
        course.creator = user;

        // Persist course to database
        await this.repository.save(course);
    }

    public async update(
        course: Course,
        updateData: CourseModifyDTO
    ): Promise<void> {
        // Set course properties
        course.title = updateData.title;
        course.description = updateData.description;
        course.estimatedTime = updateData.estimatedTime || null;
        course.materialsNeeded = updateData.materialsNeeded || null;

        // Persist updated course to database
        await this.repository.save(course);
    }

    public async delete(course: Course): Promise<void> {
        // Delete course from database
        await this.repository.remove(course);
    }
}
