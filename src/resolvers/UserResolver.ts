// Imports
import { Service } from "typedi";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import User from "../database/entities/User.entity";
import UserService from "../services/User.service";
import UserInput from "../models/UserInput";

// Resolver
@Service()
@Resolver(() => User)
export default class UserResolver {
    private userService: UserService;

    public constructor(userService: UserService) {
        this.userService = userService;
    }

    @Authorized()
    @Query(() => User)
    public async user(@Ctx("user") user: User): Promise<User> {
        return user;
    }

    @Mutation(() => Boolean)
    public async newUser(
        @Arg("userInput") userInput: UserInput
    ): Promise<boolean> {
        await this.userService.create(userInput);

        return true;
    }
}
