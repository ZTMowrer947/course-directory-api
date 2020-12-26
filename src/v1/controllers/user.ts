/* eslint-disable class-methods-use-this */
// Imports
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Location,
  OnUndefined,
  Post,
} from 'routing-controllers';
import { Connection } from 'typeorm';
import { InjectConnection } from 'typeorm-typedi-extensions';

import UserDto from '../../dto/user';
import User from '../../entities/user.entity';
import UserRepository from '../../repos/user';
import UserService from '../../services/user';
import { getConfigNameFromEnv } from '../../utils/db';

// Controller
@JsonController('/users')
class UserController {
  #userService: UserService;

  constructor(
    @InjectConnection(getConfigNameFromEnv()) connection: Connection
  ) {
    const repo = connection.getCustomRepository(UserRepository);
    this.#userService = new UserService(repo);
  }

  @Authorized()
  @Get('/')
  get(@CurrentUser({ required: true }) user: User): User {
    return user;
  }

  @Post('/')
  @Location('/api/users')
  @OnUndefined(201)
  async post(@Body() userData: UserDto): Promise<void> {
    // TODO: Check if email is already in use

    // Otherwise, create user
    await this.#userService.create(userData);
  }
}

// Exports
export default UserController;
