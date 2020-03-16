// Imports
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Location,
    OnUndefined,
    Post,
    UseInterceptor,
} from "routing-controllers";

import UserService from "../services/User.service";
import User from "../database/entities/User.entity";
import UserInterceptor from "../interceptors/UserInterceptor";
import UserModifyDTO from "../models/UserModifyDTO";

// Controller
@JsonController("/api/users")
export default class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    @Authorized()
    @Get("/")
    @UseInterceptor(UserInterceptor)
    get(@CurrentUser({ required: true }) user: User): User {
        return user;
    }

    @Post("/")
    @Location("/api/users")
    @OnUndefined(201)
    async post(@Body() userData: UserModifyDTO): Promise<void> {
        // Check if email address is already in use
        const existingUser = await this.userService.getUserByEmail(
            userData.emailAddress
        );

        // If user was found, throw 400 error
        if (existingUser) {
            throw new BadRequestError(
                "Email address is already in use by another user."
            );
        }

        // Otherwise, create user
        await this.userService.create(userData);
    }
}