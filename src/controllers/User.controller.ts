// Imports
import {
    JsonController,
    Body,
    OnUndefined,
    Post,
    Location,
} from "routing-controllers";
import { Inject } from "typedi";
import UserModifyDTO from "../models/UserModifyDTO";
import UserService from "../services/User.service";

// Controller
@JsonController("/users")
export default class UserController {
    private userService: UserService;

    public constructor(@Inject(() => UserService) userService: UserService) {
        this.userService = userService;
    }

    @Post("/")
    @OnUndefined(201)
    @Location("/")
    public async create(
        @Body({ validate: true }) userData: UserModifyDTO
    ): Promise<void> {
        return this.userService.create(userData);
    }
}
