// Imports
const UserService = require("../UserService");

// Test Suite
describe("User service", () => {
    // Declare variables for test
    let service;
    let emailAddress;

    // Run before all tests
    beforeAll(() => {
        // Initialize user service
        service = new UserService();

        // Set email address
        emailAddress = "exampleton@example.tld";
    });

    describe("create method", () => {
        test("should create a new user when given valid input data", async () => {
            // Define user data
            const userData = {
                firstName: "Examply",
                lastName: "Exampleton",
                emailAddress,
                password: "password",   // Best password ever (good thing it's only a test)
            };

            // Create new user
            const user = await service.create(userData);

            // Expect user to match input data
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.emailAddress).toBe(userData.emailAddress);
        });
    });

    describe("getUserByEmail method", () => {
        test("should find a user with the provided email address", async () => {
            // Find user with stored email address
            const user = await service.getUserByEmail(emailAddress);

            // Expect emails to match
            expect(user.emailAddress).toBe(emailAddress);
        });
    });
});
