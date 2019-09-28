// Imports
import argon2 from "argon2";
import basicAuth from "basic-auth";
import { Middleware } from "koa";
import { Container } from "typedi";
import AppError from "../models/AppError";
import AuthState from "../models/AuthState";
import UserService from "../services/User.service";

// Middleware
const auth: Middleware<AuthState> = async (ctx, next) => {
    // If a user service instance has not been attached to the state,
    if (!ctx.state.userService) {
        // Attach a UserService instance to the state
        ctx.state.userService = Container.get(UserService);
    }

    // Parse request body for credentials
    const credentials = basicAuth(ctx.req);

    // If credentials were found,
    if (credentials) {
        // Attempt to find user by email address
        const user = await ctx.state.userService.getUserByEmail(
            credentials.name
        );

        // If the user was not found,
        if (!user) {
            throw new AppError(
                `User not found with email address "${credentials.name}".`,
                404
            );
        }

        // Then, verify that password matches user data
        const passwordMatches = await argon2.verify(
            user.password,
            credentials.pass
        );

        // If the passwords do match,
        if (passwordMatches) {
            // Attach user to state
            ctx.state.user = user;

            // Continue middleware chain
            await next();
        } else {
            // Otherwise, throw error
            throw new AppError("Incorrect password.", 401);
        }
    } else {
        // Otherwise, set WWW-Authenticate header
        ctx.set("WWW-Authenticate", "Basic");

        // Throw error
        throw new AppError(
            "Credentials are required to access this route.",
            401
        );
    }
};

// Export
export default auth;
