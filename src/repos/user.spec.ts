// Imports
import { internet, name } from 'faker';

import User from '../entities/user.entity';
import { getDbConnection } from '../utils/db';
import UserRepository from './user';

// Setup tools
function setupRepository() {
  // Get database connection
  const connection = getDbConnection();

  // Retrieve entity manager and repository under test
  const repository = connection.getCustomRepository(UserRepository);
  const { manager } = connection;

  // Return extracted items
  return { manager, repository };
}

// Test Suite
describe('User repository', () => {
  test('findAll method should not be implemented', () => {
    // Setup repository
    const { repository } = setupRepository();

    // Define expected error
    const expectedError = new Error('Method not implemented.');

    // Expect findAll method to throw expected error
    expect(() => repository.findAll()).toThrowError(expectedError);
  });

  describe('findById method', () => {
    it('should return null if user cannot be found', async () => {
      // Setup repository
      const { repository } = setupRepository();

      // Define ID of nonexistent user
      const id = 2 ** 31 - 1;

      // Expect findById method to resolve to null
      await expect(repository.findById(id, false)).resolves.toBeNull();
    });

    it('should only return the user when found and relations are excluded', async () => {
      // Setup repository
      const { manager, repository } = setupRepository();

      // Generate test user
      const user = new User();
      user.firstName = name.firstName();
      user.lastName = name.lastName();
      user.emailAddress = internet.email(user.firstName, user.lastName);
      user.password = internet.password();

      // Persist user to database
      const { id } = await manager.save(user);
      user.id = id;

      try {
        // Attempt to retrieve user
        const retrievedUser = await repository.findById(id, false);

        // Expect user to have been found
        expect(retrievedUser).not.toBeNull();

        // Expect retrieved user to match input data
        expect(retrievedUser).toHaveProperty('id', id);
        expect(retrievedUser).toHaveProperty('firstName', user.firstName);
        expect(retrievedUser).toHaveProperty('lastName', user.lastName);
        expect(retrievedUser).toHaveProperty('emailAddress', user.emailAddress);
        expect(retrievedUser).toHaveProperty('version', user.version);

        // Expect password field to have not been selected
        expect(retrievedUser).not.toHaveProperty('password');
      } finally {
        // Remove test user when test is completed
        await manager.remove(user);
      }
    });

    it.todo(
      'should return relations along with found user when such are included'
    );
  });

  test('create method should persist user and return its new ID', async () => {
    // Setup repository
    const { manager, repository } = setupRepository();

    // Generate test user data
    const user = new User();
    user.firstName = name.firstName();
    user.lastName = name.lastName();
    user.emailAddress = internet.email(user.firstName, user.lastName);
    user.password = internet.password();

    // Attempt to create user and retrieve ID
    const id = await repository.create(user);
    user.id = id;

    try {
      // Attempt to retrieve user, including password, through entity manager
      const retrievedUser = await manager
        .createQueryBuilder(User, 'user')
        .addSelect('user.password')
        .where('user.id = :id', { id })
        .getOne();

      // Expect user to be found
      expect(retrievedUser).toBeDefined();

      // Expect user to match input data
      expect(retrievedUser).toHaveProperty('id', id);
      expect(retrievedUser).toHaveProperty('firstName', user.firstName);
      expect(retrievedUser).toHaveProperty('lastName', user.lastName);
      expect(retrievedUser).toHaveProperty('emailAddress', user.emailAddress);
      expect(retrievedUser).toHaveProperty('password', user.password);
      expect(retrievedUser?.password === user.password).toBeTruthy(); // TODO:ztm Replace with hash verification

      // Expect entity version to be initialized correctly
      const expectedVersion = 1;
      expect(retrievedUser).toHaveProperty('version', expectedVersion);
    } finally {
      // Remove test user when test is completed
      await manager.remove(user);
    }
  });

  test('update method should persist requested updates', async () => {
    // Setup repository
    const { manager, repository } = setupRepository();

    // Generate test user
    const originalUser = new User();
    originalUser.firstName = name.firstName();
    originalUser.lastName = name.lastName();
    originalUser.emailAddress = internet.email(
      originalUser.firstName,
      originalUser.lastName
    );
    originalUser.password = internet.password();

    // Persist user to database
    const { id } = await manager.save(originalUser);
    originalUser.id = id;

    try {
      // Generate update data
      const updatingUser = new User();
      updatingUser.firstName = name.firstName();
      updatingUser.lastName = name.lastName();
      updatingUser.emailAddress = internet.email(
        updatingUser.firstName,
        updatingUser.lastName
      );
      updatingUser.password = internet.password();

      // Attempt to update user and expect no errors
      await expect(repository.update(id, updatingUser)).resolves.not.toThrow();

      // Retrieve updated user, including password
      const updatedUser = await manager
        .createQueryBuilder(User, 'user')
        .addSelect('user.password')
        .where('user.id = :id', { id })
        .getOne();

      // Expect updated user to be found
      expect(updatedUser).toBeDefined();

      // Expect user to match input data
      expect(updatedUser).toHaveProperty('id', id);
      expect(updatedUser).toHaveProperty('firstName', updatingUser.firstName);
      expect(updatedUser).toHaveProperty('lastName', updatingUser.lastName);
      expect(updatedUser).toHaveProperty(
        'emailAddress',
        updatingUser.emailAddress
      );
      expect(updatedUser).toHaveProperty('password', updatingUser.password);
      expect(updatedUser?.password === updatingUser.password).toBeTruthy(); // TODO:ztm Replace with hash verification

      // Expect version column to have been incremented
      expect(updatedUser).toHaveProperty('version');
      expect(updatedUser?.version).toBeGreaterThan(originalUser.version);
    } finally {
      // Remove test user when test is completed
      await manager
        .createQueryBuilder()
        .delete()
        .from(User, 'user')
        .where('user.id = :id', { id })
        .execute();
    }
  });

  test('delete method should irrecoverably delete user', async () => {
    // Setup repository
    const { manager, repository } = setupRepository();

    // Generate test user
    const user = new User();
    user.firstName = name.firstName();
    user.lastName = name.lastName();
    user.emailAddress = internet.email(user.firstName, user.lastName);
    user.password = internet.password();

    // Persist user to database
    const { id } = await manager.save(user);
    user.id = id;

    try {
      // Attempt to delete user and expect no errors
      await expect(repository.delete(user)).resolves.not.toThrow();

      // Expect any attempt to retrieve user after deletion to fail
      await expect(manager.findOne(User, id)).resolves.toBeUndefined();
    } finally {
      // Remove test user, if it still exists, when test is completed
      await manager
        .createQueryBuilder()
        .delete()
        .from(User, 'user')
        .where('user.id = :id', { id })
        .execute();
    }
  });
});
