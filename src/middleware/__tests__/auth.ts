// Imports
import auth from "../auth";
import AppError from "../../models/AppError";

// Mock setup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockContext = (credentials?: string): any => {
    return {
        state: {},
        req: {
            headers: {
                authorization: credentials ? `Basic ${credentials}` : undefined,
            },
        },
        set: jest.fn(),
    };
};

// Test Suite
describe("auth middleware", () => {
    let next: jest.Mock;

    beforeEach(() => {
        // Mock next function
        next = jest.fn();
    });

    it("should throw a 401 error if no credentials are provided", async () => {
        // Mock context
        const ctx = mockContext();

        // Define expected error
        const error = new AppError(
            "Credentials are required to access this route.",
            401
        );

        // Expect 401 error to be thrown
        await expect(auth(ctx, next)).rejects.toThrowError(error);

        // Expect middleware to set WWW-Authenticate header
        expect(ctx.set).toHaveBeenCalledWith("WWW-Authenticate", "Basic");

        // Expect next function to have not been called
        expect(next).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if no user exists with the given email address", async () => {
        // Define credentials
        const credentials = Buffer.from("no@op.com:nopassword").toString(
            "base64"
        );

        // Mock context with credentials
        const ctx = mockContext(credentials);

        // Define expected error
        const error = new AppError(
            `User not found with email address "no@op.com".`,
            404
        );

        // Expect 404 error to be thrown
        await expect(auth(ctx, next)).rejects.toThrowError(error);

        // Expect next function to have not been called
        expect(next).not.toHaveBeenCalled();
    });

    it("should throw a 401 error if given an incorrect password for the associated user", async () => {
        // Define credentials
        const credentials = Buffer.from("joe@smith.com:wrongpassword").toString(
            "base64"
        );

        // Mock context with credentials
        const ctx = mockContext(credentials);

        // Define expected error
        const error = new AppError("Incorrect password.", 401);

        // Expect 401 error to be thrown
        await expect(auth(ctx, next)).rejects.toThrowError(error);

        // Expect next function to have not been called
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach a user to the context when given valid credentials", async () => {
        // Define credentials
        const credentials = Buffer.from("joe@smith.com:joepassword").toString(
            "base64"
        );

        // Mock context with credentials
        const ctx = mockContext(credentials);

        // Expect middleware to not throw any errors
        await expect(auth(ctx, next)).resolves.not.toThrow();

        // Expect user to be attached to context state
        expect(ctx.state.user).toBeDefined();

        // Expect next function to have been called
        expect(next).toHaveBeenCalled();
    });
});
