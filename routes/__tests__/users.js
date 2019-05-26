// Imports
const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../../app");


// Test Suite
describe("/api/users", () => {
    // Declare variables for test
    let emailAddress;

    // Run before all tests
    beforeAll(() => {
        // Set email address
        emailAddress = "exampleton@example.tld";
    });

    describe("POST method", () => {
        test("Should create a new user and return a 201 response", async () => {
            // Define user data
            const userData = {
                firstName: "Examply",
                lastName: "Exampleton",
                emailAddress,
                password: "password",
            };

            // POST to API
            const response = await request(app)
                .post("/api/users")
                .set("Content-Type", "application/json")
                .send(userData)
                
            // Expect a 201 Response
            expect(response.status).toBe(201);
        });
    });

    describe("GET method", () => {
        test("should get a user with the given credentials", async () => {
            // Set authentication credentials
            const credentials = {
                username: emailAddress,
                password: "password",
            };

            // GET from API
            const response = await request(app)
                .get("/api/users")
                .auth(credentials.username, credentials.password);

            // Expect a 200 OK response
            expect(response.status).toBe(200);

            // Get user from response body
            const user = response.body;

            // Expect user to match email and password data
            expect(user.emailAddress).toBe(credentials.username);
            expect(bcrypt.compareSync(credentials.password, user.password)).toBeTruthy();
        });
    });
});
