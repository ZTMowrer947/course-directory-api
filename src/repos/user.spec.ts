// Imports
import argon2 from 'argon2';
import { internet } from 'faker';

import User from '@/entities/user.entity';
import { getDbConnection } from '@/utils/db';
import { generateTestUser } from '@/utils/testing/user';

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
      const user = generateTestUser();

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
    const password = internet.password();
    const user = generateTestUser(password);

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
      await expect(
        argon2.verify(retrievedUser!.password, password)
      ).resolves.toBeTruthy();

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
    const originalUser = generateTestUser();

    // Persist user to database
    const { id } = await manager.save(originalUser);
    originalUser.id = id;

    try {
      // Generate update data
      const updatePassword = internet.password();
      const updatingUser = generateTestUser(updatePassword);

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
      await expect(
        argon2.verify(updatedUser!.password, updatePassword)
      ).resolves.toBeTruthy();

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
    const user = generateTestUser();

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

  describe('verifyCredentials method', () => {
    it("should return false if user with given email doesn't exist", async () => {
      // Setup repository
      const { repository } = setupRepository();

      // Define email and password of nonexistent user
      const emailAddress = internet.email();
      const password = internet.password();

      // Expect verifyCredentials method to resolve to false
      await expect(
        repository.verifyCredentials(emailAddress, password)
      ).resolves.toBeFalsy();
    });

    it('should return false if password is incorrect', async () => {
      // Setup repository
      const { manager, repository } = setupRepository();

      // Generate two different passwords
      const passwordA = internet.password(16);
      const passwordB = internet.password(20);

      // Generate test user
      const user = generateTestUser(passwordA);

      // Persist user to database
      const { id } = await manager.save(user);
      user.id = id;

      try {
        // Expect verifyCredentials method to resolve to false when using second password
        await expect(
          repository.verifyCredentials(user.emailAddress, passwordB)
        ).resolves.toBeFalsy();
      } finally {
        // Remove test user when test is completed
        await manager.remove(user);
      }
    });

    it('should return true if credentials are valid', async () => {
      // Setup repository
      const { manager, repository } = setupRepository();

      // Generate password
      const password = internet.password();

      // Generate test user
      const user = generateTestUser(password);

      // Persist user to database
      const { id } = await manager.save(user);
      user.id = id;

      try {
        // Expect verifyCredentials method to resolve to true
        await expect(
          repository.verifyCredentials(user.emailAddress, password)
        ).resolves.toBeTruthy();
      } finally {
        // Remove test user when test is completed
        await manager.remove(user);
      }
    });
  });
});
