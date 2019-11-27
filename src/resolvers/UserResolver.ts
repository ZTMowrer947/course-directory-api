// Imports
import { Service } from "typedi";
import { Authorized, Ctx, Resolver, Query } from "type-graphql";
import User from "../database/entities/User.entity";
import UserService from "../services/User.service";

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
}
