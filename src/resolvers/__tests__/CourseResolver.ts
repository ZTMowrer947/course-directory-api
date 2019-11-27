// Imports
import { plainToClass } from "class-transformer";
import agent from "../../koaTestAgent";
import app from "../../app";
import CourseInput from "../../models/CourseInput";

// Test Suite
describe("Course resolver", () => {
    let courseData: CourseInput;
    let id: string;
    let unusedId: string;

    // Run before all tests
    beforeAll(() => {
        // Define course data
        const plainData = {
            title: "Agent Test Course",
            description:
                "This course is a test course for the course routes within the Koa application.",
        };

        // Convert to CourseInput instance
        courseData = plainToClass(CourseInput, plainData);

        // Define unused ID
        unusedId = "A".repeat(16);
    });

    describe("courses query", () => {
        it("should return a list of courses", async () => {
            // Define GraphQL query
            const query = `
                query {
                    courses {
                        id
                        title
                        description
                        estimatedTime
                        materialsNeeded
                    }
                }
            `;

            // Define request body
            const body = {
                query,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect a 200 response
            expect(response.status).toBe(200);

            // Expect response body to contain 3 courses
            expect(response.body.data.courses).toHaveLength(3);
        });
    });

    describe("newCourse mutation", () => {
        it.todo("should return a 401 error if no authentication is provided");
        it.todo(
            "should create a new course given user authentication and valid data"
        );
        it.todo("should return a 400 error when given invalid data");
    });

    describe("course query", () => {
        it.todo("should return the course with the given ID, if found");
        it.todo(
            "hould return a 404 error if no course exists with the given ID"
        );
    });

    describe("updateCourse query", () => {
        let updateData: CourseInput;

        // Run before all tests
        beforeAll(() => {
            const plainData = {
                title: "Updated Course Title",
                description:
                    "This is test data for a course updated through the Koa application.",
                estimatedTime: "A few seconds",
            };

            updateData = plainToClass(CourseInput, plainData);
        });

        it.todo("should return a 401 error if no authentication is provided");
        it.todo(
            "should return a 403 error if the authenticating user did not create the course to be updated"
        );
        it.todo(
            "should return a 404 error if no course exists with the given ID"
        );
        it.todo(
            "should update the course with the given ID when given proper user authentication and valid update data"
        );
        it.todo("should have successfully applied the updates");
    });

    describe("deleteCourse query", () => {
        it.todo("should return a 401 error if no authentication is provided");
        it.todo(
            "should return a 403 error if the authenticating user did not create the course to be deleted"
        );
        it.todo(
            "should return a 404 error if no course exists with the given ID"
        );
        it.todo(
            "should delete the course with the given ID when given proper user authentication"
        );
        it.todo("should have successfully deleted the course");
    });
});
