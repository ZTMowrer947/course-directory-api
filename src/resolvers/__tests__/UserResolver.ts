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
        it("should create a user given valid data", async () => {
            // Define query
            const query = `
                mutation ($userInput:UserInput!) {
                    newUser(userInput:$userInput)
                }
            `;

            // Define variables
            const variables = {
                userInput: userData,
            };

            // Define request body
            const body = {
                query,
                variables,
            };

            // Make API request
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect newUser result to be true
            expect(response.body.data.newUser).toBe(true);
        });

        it("should return a validation error when given invalid data", async () => {
            // Define invalid data
            const invalidData = {
                firstName: "",
                lastName: "",
                emailAddress: "invalid",
                password: "nope",
            };

            // Define query
            const query = `
                mutation ($userInput:UserInput!) {
                    newUser(userInput:$userInput)
                }
            `;

            // Define variables
            const variables = {
                userInput: invalidData,
            };

            // Define request body
            const body = {
                query,
                variables,
            };

            // Make API request
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Get validation errors
            const {
                validationErrors,
            } = response.body.errors[0].extensions.exception;

            // Expect there to be 4 validation errors
            expect(validationErrors).toHaveLength(4);
        });

        it("should return a 400 error when trying to create a user with an email address in use by another user", async () => {
            // Define query
            const query = `
                mutation ($userInput:UserInput!) {
                    newUser(userInput:$userInput)
                }
            `;

            // Define variables
            const variables = {
                userInput: userData,
            };

            // Define request body
            const body = {
                query,
                variables,
            };

            // Make API request
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect there to be 1 GraphQL Error
            expect(response.body.errors).toHaveLength(1);

            // Define expected error message
            const expectedMessage =
                "Email address is already in use by another user.";

            // Get actual error message
            const actualMessage = response.body.errors[0].message;

            // Expect messages to match
            expect(actualMessage).toBe(expectedMessage);
        });
    });

    describe("user query", () => {
        it("should return a 401 error if no authorization is provided", async () => {
            // Define query
            const query = `
                query {
                    user {
                        id
                        firstName
                        lastName
                        emailAddress
                    }
                }
            `;

            // Define request body
            const body = {
                query,
            };

            // Make API request
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

        it("should return the proper user data when proper authentication is provided", async () => {
            // Define query
            const query = `
                query {
                    user {
                        id
                        firstName
                        lastName
                        emailAddress
                    }
                }
            `;

            // Define request body
            const body = {
                query,
            };

            // Make API request
            const response = await agent(app)
                .post("/gql")
                .send(body)
                .auth(userData.emailAddress, userData.password);

            // Get user data
            const { user } = response.body.data;

            // Expect user data to match input data
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.emailAddress).toBe(userData.emailAddress);

            // Expect password field to not be present in response data
            expect(response.body.password).toBeUndefined();
        });
    });
});
