// Imports
import { Action } from "routing-controllers";
import authChecker from "../authChecker";

// Mock setup
function mockAction(emailAddress?: string, password?: string): Action {
    // Declare variable for auth header
    let authHeader = "";

    if (emailAddress && password) {
        // Encode credentials using base64
        const encoded = Buffer.from(`${emailAddress}:${password}`).toString(
            "base64"
        );

        // Set authorization header
        authHeader = `Basic ${encoded}`;
    }

    return {
        request: {
            headers: {
                authorization: authHeader || undefined,
            },
        },
        response: {},
    };
}

// Test Suite
describe("auth checker", () => {
    it("should deny access if no authorization header is provided", async () => {
        // Get mock action data
        const action = mockAction();

        // Attempt authentication and expect access to be denied
        await expect(authChecker(action)).resolves.toBeFalsy();
    });

    it("should deny access if using an email address not associated with a user", async () => {
        // Define credentials
        const emailAddress = "unused@example.tld";
        const password = "password";

        // Get mock action data
        const action = mockAction(emailAddress, password);

        // Attempt authentication and expect access to be denied
        await expect(authChecker(action)).resolves.toBeFalsy();
    });

    it("should deny access if the incorrect password is used", async () => {
        // Define credentials
        const emailAddress = "joe@smith.com";
        const password = "password";

        // Get mock action data
        const action = mockAction(emailAddress, password);

        // Attempt authentication and expect access to be denied
        await expect(authChecker(action)).resolves.toBeFalsy();
    });

    it("should grant access with a valid email/password combination", async () => {
        // Define credentials
        const emailAddress = "joe@smith.com";
        const password = "joepassword";

        // Get mock action data
        const action = mockAction(emailAddress, password);

        // Attempt authentication and expect access to be granted
        await expect(authChecker(action)).resolves.toBeTruthy();
    });
});
