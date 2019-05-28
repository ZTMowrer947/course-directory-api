// Imports
const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../../app");

// Test Suite
describe("/api/v1/courses", () => {
    // Declare variables for tests
    let userCredentials, user, courseId;

    // Run before all tests
    beforeAll(async () => {
        // Define user data
        userCredentials = {
            emailAddress: "exampleton@test.tld",
            password: "example",
        };

        userData = {
            ...userCredentials,
            firstName: "Examply",
            lastName: "Exampleton",
        };

        // Create new user
        const userCreateResponse = await request(app)
            .post("/api/users")
            .send(userData);

        // Throw error if response status indicates an error
        if (userCreateResponse.status >= 400)
            throw new Error("User creation returned error response, cannot proceed with course route tests.");

        // Retrive newly created user by email address
        const userGetResponse = await request(app)
            .get("/api/users")
            .auth(userCredentials.emailAddress, userCredentials.password);

        // Throw error if response status indicates an error
        if (userGetResponse.status >= 400)
            throw new Error("User retrival returned error response, cannot proceed with course route tests.");

        // Store user for test usage
        user = userGetResponse.body;
    });

    describe("POST method", () => {
        test("should create a new course, owned by the authenticated user", async () => {
            // Define course data
            const courseData = {
                title: "How to write tests using Jest",
                description: "In this course, you'll learn how to write tests for your JavaScript code using the Jest testing framework.",
            };

            // Create course
            const response = await request(app)
                .post("/api/courses")
                .auth(userCredentials.emailAddress, userCredentials.password)
                .send(courseData);

            // Expect a 201 Created Response
            expect(response.status).toBe(201);

            // Expect Location header to be set correctly
            expect(response.headers.location).toEqual(expect.stringMatching(/^\/api\/courses\/\d+$/));
        });
    });
})