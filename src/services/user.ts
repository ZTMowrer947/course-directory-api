// Imports
import UserDto from '../dto/user';
import User from '../entities/user.entity';
import type { TypeOrPromise } from '../repos/base';
import type { IUserRepository } from '../repos/user';
import BaseService, { IService } from './base';

// Service interface
interface IUserService extends IService<User, UserDto> {
  verifyCredentials(
    emailAddress: string,
    password: string
  ): TypeOrPromise<boolean>;
}

// Service
class UserService extends BaseService<User, UserDto> implements IUserService {
  #userRepository: IUserRepository;

  constructor(repository: IUserRepository) {
    super(repository);
    this.#userRepository = repository;
  }

  verifyCredentials(
    emailAddress: string,
    password: string
  ): TypeOrPromise<boolean> {
    return this.#userRepository.verifyCredentials(emailAddress, password);
  }
}

// Exports
export default UserService;
export type { IUserService };
