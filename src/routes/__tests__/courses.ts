// Imports
import { plainToClass } from "class-transformer";
import CourseInput from "../../models/CourseInput";
import agent from "../../koaTestAgent";
import app from "../../app";

// Test Suite
describe("/api/v1/courses", () => {
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

    describe("GET method", () => {
        it("should retrieve a list of courses", async () => {
            // Make API request
            const response = await agent(app).get("/api/courses");

            // Expect a 200 response
            expect(response.status).toBe(200);

            // Expect response body to contain 3 courses
            expect(response.body).toHaveLength(3);
        });
    });

    describe("POST method", () => {
        it("should return a 401 error if no authentication is provided", async () => {
            // Make API request
            const response = await agent(app)
                .post("/api/courses")
                .send(courseData);

            // Expect a 401 response
            expect(response.status).toBe(401);

            // Define expected error message
            const expectedError =
                "Credentials are required to access this route.";

            // Get actual error message
            const actualError = response.body.message;

            // Expect error messages to match
            expect(actualError).toBe(expectedError);
        });

        it("should create a new course given user authentication and valid data", async () => {
            // Make API request
            const response = await agent(app)
                .post("/api/courses")
                .auth("joe@smith.com", "joepassword")
                .send(courseData);

            // Expect a 201 response
            expect(response.status).toBe(201);

            // Expect location header to be set correctly
            const location: string = response.header.location;
            expect(location).toEqual(
                expect.stringMatching(/\/api\/courses\/([A-Z2-7]{16})$/)
            );

            // Get ID from location header
            const idMatch = location.match(/[A-Z2-7]{16}$/g);
            expect(idMatch).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            id = idMatch![0];
        });

        it("should return a 400 error when given invalid data", async () => {
            // Define invalid course data
            const invalidPlainData = {
                title: "invalid".repeat(32),
                description: "",
            };

            const invalidData = plainToClass(CourseInput, invalidPlainData);

            // Make API request
            const response = await agent(app)
                .post("/api/courses")
                .auth("joe@smith.com", "joepassword")
                .send(invalidData);

            // Expect a 400 response
            expect(response.status).toBe(400);

            // Expect response body to have errors property
            expect(response.body).toHaveProperty("errors");

            // Expect error array to have length of 2
            expect(response.body.errors).toHaveLength(2);
        });
    });

    describe("/:id", () => {
        describe("GET method", () => {
            it("should return the course with the given ID, if found", async () => {
                // Make API request
                const response = await agent(app).get(`/api/courses/${id}`);

                // Expect a 200 response
                expect(response.status).toBe(200);

                // Get course data
                const course = response.body;

                // Expect course to match input data
                expect(course.id).toBe(id);
                expect(course.title).toBe(courseData.title);
                expect(course.description).toBe(courseData.description);
            });

            it("should return a 404 error if no course exists with the given ID", async () => {
                // Make API request
                const response = await agent(app).get(
                    `/api/courses/${unusedId}`
                );

                // Expect a 404 response
                expect(response.status).toBe(404);

                // Define expected error message
                const expectedError = `Course not found with ID "${unusedId}".`;

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });
        });

        describe("PUT method", () => {
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

            it("should return a 401 error if no authentication is provided", async () => {
                // Make API request
                const response = await agent(app)
                    .put(`/api/courses/${id}`)
                    .send(updateData);

                // Expect a 401 response
                expect(response.status).toBe(401);

                // Define expected error message
                const expectedError =
                    "Credentials are required to access this route.";

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should return a 403 error if the authenticating user did not create the course to be updated", async () => {
                // Make API request
                const response = await agent(app)
                    .put(`/api/courses/${id}`)
                    .auth("sally@jones.com", "sallypassword")
                    .send(updateData);

                // Expect a 403 response
                expect(response.status).toBe(403);

                // Define expected error message
                const expectedError =
                    "You are not allowed to modify this resource.";

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should return a 404 error if no course exists with the given ID", async () => {
                // Make API request
                const response = await agent(app)
                    .put(`/api/courses/${unusedId}`)
                    .auth("joe@smith.com", "joepassword");

                // Expect a 404 response
                expect(response.status).toBe(404);

                // Define expected error message
                const expectedError = `Course not found with ID "${unusedId}".`;

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should update the course with the given ID when given proper user authentication and valid update data", async () => {
                // Make API request
                const response = await agent(app)
                    .put(`/api/courses/${id}`)
                    .auth("joe@smith.com", "joepassword")
                    .send(updateData);

                // Expect a 204 response
                expect(response.status).toBe(204);
            });

            it("should have successfully applied the updates", async () => {
                // Make API request
                const response = await agent(app).get(`/api/courses/${id}`);

                // Expect a 200 response
                expect(response.status).toBe(200);

                // Get course data
                const course = response.body;

                // Expect course to match update data
                expect(course.id).toBe(id);
                expect(course.title).toBe(updateData.title);
                expect(course.description).toBe(updateData.description);
                expect(course.estimatedTime).toBe(updateData.estimatedTime);
            });
        });

        describe("DELETE method", () => {
            it("should return a 401 error if no authentication is provided", async () => {
                // Make API request
                const response = await agent(app).delete(`/api/courses/${id}`);

                // Expect a 401 response
                expect(response.status).toBe(401);

                // Define expected error message
                const expectedError =
                    "Credentials are required to access this route.";

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should return a 403 error if the authenticating user did not create the course to be deleted", async () => {
                // Make API request
                const response = await agent(app)
                    .delete(`/api/courses/${id}`)
                    .auth("sally@jones.com", "sallypassword");

                // Expect a 403 response
                expect(response.status).toBe(403);

                // Define expected error message
                const expectedError =
                    "You are not allowed to modify this resource.";

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should return a 404 error if no course exists with the given ID", async () => {
                // Make API request
                const response = await agent(app)
                    .delete(`/api/courses/${unusedId}`)
                    .auth("joe@smith.com", "joepassword");

                // Expect a 404 response
                expect(response.status).toBe(404);

                // Define expected error message
                const expectedError = `Course not found with ID "${unusedId}".`;

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });

            it("should delete the course with the given ID when given proper user authentication", async () => {
                // Make API request
                const response = await agent(app)
                    .delete(`/api/courses/${id}`)
                    .auth("joe@smith.com", "joepassword");

                // Expect a 204 response
                expect(response.status).toBe(204);
            });

            it("should have successfully deleted the course", async () => {
                // Make API request
                const response = await agent(app).get(`/api/courses/${id}`);

                // Expect a 404 response
                expect(response.status).toBe(404);

                // Define expected error message
                const expectedError = `Course not found with ID "${id}".`;

                // Get actual error message
                const actualError = response.body.message;

                // Expect error messages to match
                expect(actualError).toBe(expectedError);
            });
        });
    });
});
