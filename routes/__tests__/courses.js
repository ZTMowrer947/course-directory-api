// Imports
const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../../app");

// Test Suite
describe("/api/v1/courses", () => {
    // Declare variables for tests
    let userCredentials, user, courseId, courseData;

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

        // Define course data
        courseData = {
            title: "How to write tests using Jest",
            description: "In this course, you'll learn how to write tests for your JavaScript code using the Jest testing framework.",
        };
    });

    describe("POST method", () => {
        test("should create a new course, owned by the authenticated user", async () => {
            // Create course
            const response = await request(app)
                .post("/api/courses")
                .auth(userCredentials.emailAddress, userCredentials.password)
                .send(courseData);

            // Expect a 201 Created Response
            expect(response.status).toBe(201);

            // Expect Location header to be set correctly
            expect(response.headers.location).toEqual(expect.stringMatching(/^\/api\/courses\/\d+$/));

            // Get location of new course
            const location = response.headers.location

            // Get last index of "/" in location
            const lastSlashIndex = location.lastIndexOf("/");

            // Get course ID from location
            courseId = parseInt(location.substring(lastSlashIndex + 1));

            // Expect courseId not to be NaN (not a number)
            expect(isNaN(courseId)).toBe(false);
        });
    });

    describe("GET method", () => {
        test("should retrieve a list of all courses", async () => {
            // Get list of courses
            const response = await request(app)
                .get("/api/courses");

            // Expect a 200 OK Response
            expect(response.status).toBe(200);

            // Find course with ID matching the one stored earlier
            const testCourse = response.body.find(course => course.id === courseId);

            // Expect test course to have been found
            expect(testCourse).not.toBeFalsy();

            // Expect test course to match input data
            expect(testCourse.title).toBe(courseData.title);
            expect(testCourse.description).toBe(courseData.description);
            expect(testCourse.estimatedTime).toBeNull();
            expect(testCourse.materialsNeeded).toBeNull();

            // Expect test course to be owned by test user
            expect(testCourse.userId).toBe(user.id);
            expect(testCourse.user.firstName).toBe(user.firstName);
            expect(testCourse.user.lastName).toBe(user.lastName);
            expect(testCourse.user.emailAddress).toBe(user.emailAddress);
            expect(testCourse.user.password).toBe(user.password);
        });
    });

    describe("/:id", () => {
        describe("GET method", () => {
            test("should return a course with the provided ID", async () => {
                // Get one course
                const response = await request(app)
                    .get(`/api/courses/${courseId}`);

                // Expect a 200 OK response
                expect(response.status).toBe(200);
                
                // Get course from response body
                const course = response.body;

                // Expect course to match course input data
                expect(course.title).toBe(courseData.title);
                expect(course.description).toBe(courseData.description);
                expect(course.estimatedTime).toBeNull();
                expect(course.materialsNeeded).toBeNull();

                // Expect test course to be owned by test user
                expect(course.userId).toBe(user.id);
                expect(course.user.firstName).toBe(user.firstName);
                expect(course.user.lastName).toBe(user.lastName);
                expect(course.user.emailAddress).toBe(user.emailAddress);
                expect(course.user.password).toBe(user.password);
            });
        });
    });
})