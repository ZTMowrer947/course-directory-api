// Imports
import argon2 from "argon2";
import { getRepository } from "typeorm";
import User from "../../database/entities/User.entity";
import UserService from "../User.service";
import UserModifyDTO from "../../models/UserModifyDTO";
import AppError from "../../models/AppError";

// Test Suite
describe("User service", () => {
    let userService: UserService;
    let userData: UserModifyDTO;

    // Run before all tests
    beforeAll(() => {
        // Get user repository
        const repository = getRepository(User);

        // Initialize user service
        userService = new UserService(repository);

        // Define user data
        userData = new UserModifyDTO();
        userData.firstName = "Examply";
        userData.lastName = "Exampleton";
        userData.emailAddress = "exampleton@test.tld";
        userData.password = "examplepass";
    });

    describe("create method", () => {
        it("should create a user", async () => {
            // Create user and expect no errors
            await expect(userService.create(userData)).resolves.toBeUndefined();
        });
    });

    describe("getUserByEmail method", () => {
        it("should return a user with a matching email", async () => {
            // Find user by email
            const user = await userService.getUserByEmail(
                userData.emailAddress
            );

            // Expect user to match input data
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.emailAddress).toBe(userData.emailAddress);
            await expect(
                argon2.verify(user.password, userData.password)
            ).resolves.toBeTruthy();
        });

        it("should throw an error if a user with a matching email wasn't found", async () => {
            // Define unused email
            const unusedEmail = "unused@example.tld";

            // Define expected error
            const error = new AppError(`User not found with email address "unused@example.tld".`, 404);

            // Expect user fetch to throw error
            await expect(
                userService.getUserByEmail(unusedEmail)
            ).rejects.toThrowError(error);
        });
    });
});
