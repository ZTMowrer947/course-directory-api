// Imports
import { plainToClass } from "class-transformer";
import UserInput from "../../models/UserInput";
import agent from "../../koaTestAgent";
import app from "../../app";

// Test Suite
describe("/api/v1/users", () => {
    let userData: UserInput;

    // Run before all tests
    beforeAll(() => {
        const plainData = {
            firstName: "Jester",
            lastName: "Tester",
            emailAddress: "jestert39018@jestjs.io",
            password: "ch@0schaos",
        };

        userData = plainToClass(UserInput, plainData);
    });

    describe("newUser mutation", () => {
        it.todo("should return a validation error when given invalid data");
        it.todo(
            "should return a 400 error when trying to create a user with an email address in use by another user"
        );
    });

    describe("user query", () => {
        it.todo(
            "should return a 400 error when trying to create a user with an email address in use by another user"
        );
        it.todo(
            "should return the proper user data when proper authentication is provided"
        );
    });
});
