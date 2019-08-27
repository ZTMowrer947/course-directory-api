// Imports
import argon2 from "argon2";
import basicAuth from "basic-auth";
import { Action } from "routing-controllers";
import { Container } from "typedi";
import UserService from "./services/User.service";

// Auth Checker
const authChecker = async (action: Action): Promise<boolean> => {
    // Get authorization credentials
    const credentials = basicAuth(action.request);

    // If this fails, deny access
    if (!credentials) return false;

    // Get user service from TypeDI container
    const userService = Container.get(UserService);

    try {
        // Attempt to find user by email address
        const user = await userService.getUserByEmail(credentials.name);

        // If successful, grant access if password is correct
        return argon2.verify(user.password, credentials.pass);
    } catch (error) {
        // If any errors occur, deny access
        return false;
    }
};

// Export
export default authChecker;
