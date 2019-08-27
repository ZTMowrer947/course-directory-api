// Imports
import {
    JsonController,
    Body,
    OnUndefined,
    Post,
    Location,
} from "routing-controllers";
import { InjectRepository } from "typeorm-typedi-extensions";
import UserModifyDTO from "../models/UserModifyDTO";
import UserService from "../services/User.service";
import User from "../database/entities/User.entity";

// Controller
@JsonController("/users")
export default class UserController {
    private userService: UserService;

    public constructor(@InjectRepository(User) userService: UserService) {
        this.userService = userService;
    }

    @Post("/")
    @OnUndefined(201)
    @Location("/")
    public async create(@Body() userData: UserModifyDTO): Promise<void> {
        return this.userService.create(userData);
    }
}
