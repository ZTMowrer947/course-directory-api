// Imports
import argon2 from "argon2";
import basicAuth from "basic-auth";
import { Container } from "typedi";
import { AuthChecker } from "type-graphql";
import GraphQLContext from "./models/GraphQLContext";
import UserService from "./services/User.service";

// Auth checker
const authChecker: AuthChecker<GraphQLContext> = async ({ context }) => {
    // Get user service
    const userService = Container.get(UserService);

    // Get credentials
    const credentials = basicAuth(context.koaCtx.req);

    // Attempt to find user using email
    const user =
        credentials && (await userService.getUserByEmail(credentials.name));

    // Grant access if credentials were extracted, user exists, and password matches
    return (
        !!credentials &&
        !!user &&
        (await argon2.verify(user.password, credentials.pass))
    );
};

// Export
export default authChecker;
