// Imports
import { getRepository } from "typeorm";
import Course from "../../database/entities/Course.entity";
import CourseService from "../Course.service";
import AppError from "../../models/AppError";

// Test Suite
describe("Course service", () => {
    let courseService: CourseService;
    let id: string;
    let unusedId: string;

    // Run before all tests
    beforeAll(() => {
        // Set unused ID
        unusedId = "A".repeat(16);

        // Get user repository
        const repository = getRepository(Course);

        // Initialize user service
        courseService = new CourseService(repository);
    });

    describe("getList method", () => {
        it("should return a list of all courses", async () => {
            // Get course listing
            const courses = await courseService.getList();

            // Expect there to be 3 courses in the database
            expect(courses).toHaveLength(3);

            // Get ID of first course
            id = courses[0].id;
        });
    });

    describe("getById method", () => {
        it("should return the course with the given ID, if found", async () => {
            // Get course with ID
            const course = await courseService.getCourseById(id);

            // Expect IDs to match
            expect(course.id).toBe(id);
        });

        it("should throw a 404 error if no course exists with the given ID", async () => {
            // Define expected error
            const error = new AppError(
                `Course not found with ID "${unusedId}".`,
                404
            );

            // Expect course retrieval to throw 404 error
            await expect(
                courseService.getCourseById(unusedId)
            ).rejects.toThrowError(error);
        });
    });
});
