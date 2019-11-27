// Imports
import { plainToClass } from "class-transformer";
import agent from "../../koaTestAgent";
import app from "../../app";
import CourseInput from "../../models/CourseInput";

// GraphQL queries
const queries = {
    courses: `
        query {
            courses {
                id
                title
                description
                estimatedTime
                materialsNeeded
            }
        }
    `,
    course: `
        query ($id:ID!) {
            course(id:$id) {
                id
                title
                description
                estimatedTime
                materialsNeeded
            }
        }
    `,
    newCourse: `
        mutation ($courseInput:CourseInput!) {
            newCourse(courseInput:$courseInput)
        }
    `,
    updateCourse: `
        mutation ($id:ID!, $courseInput:CourseInput!) {
            updateCourse(id:$id, courseInput:$courseInput)
        }
    `,
    deleteCourse: `
        mutation ($id:ID!) {
            deleteCourse(id:$id)
        }
    `,
};

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
            // Define request body
            const body = {
                query: queries.courses,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect response body to contain 3 courses
            expect(response.body.data.courses).toHaveLength(3);
        });
    });

    describe("newCourse mutation", () => {
        it("should return an authorization error if no authentication is provided", async () => {
            // Define variables
            const variables = {
                courseInput: courseData,
            };

            // Define request body
            const body = {
                query: queries.newCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "Credentials are required to perform the requested action.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should create a new course given user authentication and valid data", async () => {
            // Define variables
            const variables = {
                courseInput: courseData,
            };

            // Define request body
            const body = {
                query: queries.newCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect response to contain new course id
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("newCourse");

            // Store id for later use
            id = response.body.data.newCourse;
        });

        it("should return a validation error when given invalid data", async () => {
            // Define invalid course data
            const invalidPlainData = {
                title: "invalid".repeat(32),
                description: "",
            };

            const invalidData = plainToClass(CourseInput, invalidPlainData);

            // Define variables
            const variables = {
                courseInput: invalidData,
            };

            // Define request body
            const body = {
                query: queries.newCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Get validation errors
            const {
                validationErrors,
            } = response.body.errors[0].extensions.exception;

            // Expect there to be 2 validation errors
            expect(validationErrors).toHaveLength(2);
        });
    });

    describe("course query", () => {
        it("should return the course with the given ID, if found", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.course,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Get course data
            const { course } = response.body.data;

            // Expect course to match input data
            expect(course.id).toBe(id);
            expect(course.title).toBe(courseData.title);
            expect(course.description).toBe(courseData.description);
        });

        it("should return a Not Found error if no course exists with the given ID", async () => {
            // Define variables
            const variables = {
                id: unusedId,
            };

            // Define request body
            const body = {
                query: queries.course,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage = `Course not found with ID "${unusedId}".`;

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });
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

        it("should return an authorization error if no authentication is provided", async () => {
            // Define variables
            const variables = {
                courseInput: updateData,
                id,
            };

            // Define request body
            const body = {
                query: queries.updateCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "Credentials are required to perform the requested action.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should return a Forbidden error if the authenticating user did not create the course to be updated", async () => {
            // Define variables
            const variables = {
                courseInput: updateData,
                id,
            };

            // Define request body
            const body = {
                query: queries.updateCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("sally@jones.com", "sallypassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "You are not allowed to modify this resource.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should return a Not Found error if no course exists with the given ID", async () => {
            // Define variables
            const variables = {
                courseInput: updateData,
                id: unusedId,
            };

            // Define request body
            const body = {
                query: queries.updateCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage = `Course not found with ID "${unusedId}".`;

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should return a validation error when given invalid data", async () => {
            // Define invalid course data
            const invalidPlainData = {
                title: "invalid".repeat(32),
                description: "",
            };

            const invalidData = plainToClass(CourseInput, invalidPlainData);

            // Define variables
            const variables = {
                courseInput: invalidData,
                id,
            };

            // Define request body
            const body = {
                query: queries.updateCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Get validation errors
            const {
                validationErrors,
            } = response.body.errors[0].extensions.exception;

            // Expect there to be 2 validation errors
            expect(validationErrors).toHaveLength(2);
        });

        it("should update the course with the given ID when given proper user authentication and valid update data", async () => {
            // Define variables
            const variables = {
                courseInput: updateData,
                id,
            };

            // Define request body
            const body = {
                query: queries.updateCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect updateCourse result to be true
            expect(response.body.data.updateCourse).toBe(true);
        });

        it("should have successfully applied the updates", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.course,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Get course data
            const { course } = response.body.data;

            // Expect course to match update data
            expect(course.id).toBe(id);
            expect(course.title).toBe(updateData.title);
            expect(course.description).toBe(updateData.description);
        });
    });

    describe("deleteCourse query", () => {
        it("should return an authorization error if no authentication is provided", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.deleteCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "Credentials are required to perform the requested action.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should return a Forbidden error if the authenticating user did not create the course to be deleted", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.deleteCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("sally@jones.com", "sallypassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "You are not allowed to modify this resource.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should return a Not Found error if no course exists with the given ID", async () => {
            // Define variables
            const variables = {
                id: unusedId,
            };

            // Define request body
            const body = {
                query: queries.deleteCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage = `Course not found with ID "${unusedId}".`;

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });

        it("should delete the course with the given ID when given proper user authentication", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.deleteCourse,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect deleteCourse result to be true
            expect(response.body.data.deleteCourse).toBe(true);
        });

        it("should have successfully deleted the course", async () => {
            // Define variables
            const variables = {
                id,
            };

            // Define request body
            const body = {
                query: queries.course,
                variables,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth("joe@smith.com", "joepassword");

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage = `Course not found with ID "${id}".`;

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });
    });
});
