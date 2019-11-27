// Imports
import argon2 from "argon2";
import basicAuth from "basic-auth";
import { Container } from "typedi";
import { AuthChecker, Ctx } from "type-graphql";
import AppError from "./models/AppError";
import GraphQLContext from "./models/GraphQLContext";
import UserService from "./services/User.service";

// Auth checker
const authChecker: AuthChecker<GraphQLContext> = async ({ context }) => {
    // Get user service
    const userService = Container.get(UserService);

    // Get credentials
    const credentials = basicAuth(context.koaCtx.req);

    // If credentials were not found, throw error
    if (!credentials) {
        context.koaCtx.set("WWW-Authenticate", "Basic");

        throw new AppError(
            "Credentials are required to perform the requested action.",
            401
        );
    }

    // Attempt to find user using email
    const user = await userService.getUserByEmail(credentials.name);

    // If user was not found, deny access
    if (!user) return false;

    // Otherwise, check if correct password was supplied
    const validPassword = await argon2.verify(user.password, credentials.pass);

    // If not, deny access
    if (!validPassword) return false;

    // Otherwise, attach user to context
    context.user = user;

    // Grant access
    return true;
};

// Export
export default authChecker;
