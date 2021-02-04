// Imports
import argon2 from 'argon2';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import User from '@/database/entities/User';
import env from '@/env';
import UserModifyDTO from '@/models/UserModifyDTO';

// Service
@Service()
export default class UserService {
  readonly #repository: Repository<User>;

  public constructor(
    @InjectRepository(User, env) repository: Repository<User>
  ) {
    this.#repository = repository;
  }

  public async findByEmail(emailAddress: string): Promise<User | undefined> {
    // Create query
    const query = this.#repository
      .createQueryBuilder('users')
      .where('users.emailAddress = :emailAddress', { emailAddress });

    // Execute query
    const user = await query.getOne();

    // Return the user
    return user;
  }

  public async create(userData: UserModifyDTO): Promise<void> {
    // Create user instance
    const user = new User();

    // Set user properties
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.emailAddress = userData.emailAddress;
    user.password = userData.password;

    // Persist user to database
    await this.#repository.save(user);
  }

  public async verifyCredentials(
    emailAddress: string,
    password: string
  ): Promise<boolean> {
    try {
      const userData = await this.#repository.findOneOrFail(
        {
          emailAddress,
        },
        {
          select: ['password'],
        }
      );

      return argon2.verify(userData.password, password);
    } catch {
      return false;
    }
  }
}
