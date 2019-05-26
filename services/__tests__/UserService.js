// Imports
const UserService = require("../UserService");
const bcrypt = require("bcryptjs");

// Test Suite
describe("User service", () => {
    // Declare variables for test
    let service;
    let userData;

    // Run before all tests
    beforeAll(() => {
        // Initialize user service
        service = new UserService();

        // Set user data
        userData = {
            firstName: "Examply",
            lastName: "Exampleton",
            emailAddress: "exampleton@example.tld",
            password: "password",   // Best password ever (good thing it's only a test)
        };
    });

    describe("create method", () => {
        test("should create a new user when given valid input data", async () => {
            // Create new user
            const user = await service.create(userData);

            // Expect user to match input data
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.emailAddress).toBe(userData.emailAddress);
            expect(bcrypt.compareSync(userData.password, user.password)).toBeTruthy();
        });
    });

    describe("getUserByEmail method", () => {
        test("should find a user with the provided email address", async () => {
            // Find user with stored email address
            const user = await service.getUserByEmail(userData.emailAddress);

            // Expect user to match user data
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.emailAddress).toBe(userData.emailAddress);
            expect(bcrypt.compareSync(userData.password, user.password)).toBeTruthy();
        });
    });
});
