/* eslint class-methods-use-this: ["error", { "exceptMethods": ["findAll"] }] */
// Imports
import { EntityRepository } from 'typeorm';

import { EntityId } from '../entities/base';
import User from '../entities/user.entity';
import BaseRepository, { IRepository, TypeOrPromise } from './base';

// Repository interface
interface IUserRepository extends IRepository<User> {
  verifyCredentials(
    emailAddress: string,
    password: string
  ): TypeOrPromise<boolean>;
}

// Repository
@EntityRepository(User)
class UserRepository extends BaseRepository<User> implements IUserRepository {
  async verifyCredentials(
    emailAddress: string,
    password: string
  ): Promise<boolean> {
    // First, retrieve user with email, selecting it and password
    const queryResult = await this.repository
      .createQueryBuilder('user')
      .select('user.emailAddress', 'emailAddress')
      .addSelect('user.password', 'password')
      .where('user.emailAddress = :emailAddress', { emailAddress })
      .getRawOne<Pick<User, 'emailAddress' | 'password'>>();

    // Then, verify user was found and has correct password
    return !!queryResult?.emailAddress && queryResult?.password === password; // TODO: Compare hash against input password
  }

  findAll(): User[] {
    // Method is intentionally unimplemented
    throw new Error('Method not implemented.');
  }

  async findById(
    id: EntityId,
    includeRelations: boolean
  ): Promise<User | null> {
    // Create query builder
    const query = this.repository.createQueryBuilder('user');

    // Include relations if desired
    if (includeRelations) {
      // TODO: Include user relations
    }

    // Complete and execute query
    return (await query.where('user.id = :id', { id }).getOne()) ?? null;
  }
}

// Exports
export default UserRepository;
export type { IUserRepository };
