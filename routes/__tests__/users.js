// Imports
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
});
