// Imports
import { plainToClass } from "class-transformer";
import { getRepository } from "typeorm";
import Course from "../../database/entities/Course";
import User from "../../database/entities/User";
import CourseModifyDTO from "../../models/CourseModifyDTO";
import CourseService from "../CourseService";
import UserService from "../UserService";

// Test Suite
describe("Course service", () => {
    let courseService: CourseService;
    let user: User;
    let id: string;
    let unusedId: string;
    let course: Course;

    // Run before all tests
    beforeAll(async () => {
        // Set unused ID
        unusedId = "A".repeat(16);

        // Get course repository
        const repository = getRepository(Course);

        // Initialize course service
        courseService = new CourseService(repository);

        // Get user service
        const userRepository = getRepository(User);
        const userService = new UserService(userRepository);

        // Find user for testing
        user = (await userService.getUserByEmail("joe@smith.com"))!;
    });

    describe("getList method", () => {
        it("should return a list of all courses", async () => {
            // Get course listing
            const courses = await courseService.getList();

            // Expect there to be 3 courses in the database
            expect(courses).toHaveLength(3);
        });
    });

    describe("create method", () => {
        let courseData: CourseModifyDTO;

        beforeAll(() => {
            const plainData = {
                title: "Test Course",
                description:
                    "This is a test course for testing the Course service using Jest.",
            };

            courseData = plainToClass(CourseModifyDTO, plainData);
        });

        it("should create a course", async () => {
            // Create course
            id = await courseService.create(user, courseData);

            // Expect course ID to be defined
            expect(id).toBeDefined();
        });
    });

    describe("getById method", () => {
        it("should return the course with the given ID, if found", async () => {
            // Get course with ID
            course = (await courseService.getCourseById(id))!;

            // Expect IDs to match
            expect(course.id).toBe(id);
        });

        it("should return undefined if no course exists with the given ID", async () => {
            // Attempt to find course by ID
            const course = await courseService.getCourseById(unusedId);

            // Expect course to be undefined
            expect(course).toBeUndefined();
        });
    });

    describe("update method", () => {
        let updateData: CourseModifyDTO;

        beforeAll(() => {
            const plainData = {
                title: "Updated Test Course",
                description:
                    "This is an updated test course for testing the Course service using Jest.",
                estimatedTime: "2 nanoseconds",
            };

            updateData = plainToClass(CourseModifyDTO, plainData);
        });

        it("should update a course without errors", async () => {
            // Update course and expect no errors
            await expect(
                courseService.update(course, updateData)
            ).resolves.not.toThrow();
        });

        it("should have applied the updates successfully", async () => {
            // Get updated course
            course = (await courseService.getCourseById(id))!;

            // Expect course to match updated data
            expect(course.title).toBe(updateData.title);
            expect(course.description).toBe(updateData.description);
            expect(course.estimatedTime).toBe(updateData.estimatedTime);
            expect(course.materialsNeeded).toBeNull();
        });
    });

    describe("delete method", () => {
        it("should delete the course", async () => {
            // Delete the course and expect no errors
            await expect(courseService.delete(course)).resolves.not.toThrow();
        });

        it("should have deleted the course successfully", async () => {
            // Attempt to find course by ID
            const course = await courseService.getCourseById(id);

            // Expect course to be undefined
            expect(course).toBeUndefined();
        });
    });
});
