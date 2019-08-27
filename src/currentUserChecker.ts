/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Imports
import basicAuth from "basic-auth";
import { Action } from "routing-controllers";
import { Container } from "typedi";
import UserService from "./services/User.service";
import User from "./database/entities/User.entity";

// Current User Checker
const currentUserChecker = async (action: Action): Promise<User> => {
    // Get authorization credentials
    const credentials = basicAuth(action.request)!;

    // Get user service from TypeDI container
    const userService = Container.get(UserService);

    // Find user by email address
    return userService.getUserByEmail(credentials.name);
};

// Export
export default currentUserChecker;
