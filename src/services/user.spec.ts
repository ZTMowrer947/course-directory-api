// Imports
import { internet } from 'faker';

import UserRepository from '../repos/user';
import { generateTestUser, generateTestUserDto } from '../utils/testing/user';
import UserService from './user';

// Mock setup
jest.mock('../repos/user');

// Test Setup
function setupService() {
  // Initialize mocked user repository
  const repository = new UserRepository();

  // Use repository to initialize service
  const service = new UserService(repository);

  // Return mock repository and service
  return { repository, service };
}

// Test Suite
describe('User service', () => {
  test('getAll method should not be implemented', async () => {
    // Setup service
    const { service } = setupService();

    // Define expected error
    const expectedError = new Error('Method not implemented.');

    // Expect getAll method to throw expected error
    await expect(async () => service.getAll()).rejects.toThrowError(
      expectedError
    );
  });

  describe('getById method', () => {
    it('should throw an error if user cannot be found', async () => {
      // Setup service
      const { service } = setupService();

      // Define ID of nonexistent user
      const id = 2 ** 32 - 1;

      // Define expected error
      const expectedError = new Error(`Entity not found with ID "${id}".`);

      // Expect getById method to throw error
      await expect(async () => service.getById(id, false)).rejects.toThrowError(
        expectedError
      );
    });

    it('should only return the user when found and relations are excluded', async () => {
      // Setup service
      const { repository, service } = setupService();

      // Generate test user
      const user = generateTestUser();
      user.id = await repository.create(user);

      try {
        // Retrieve user through service
        const retrievedUser = await service.getById(user.id, false);

        // Expect user to have been found
        expect(retrievedUser).not.toBeNull();

        // Expect retrieved user to match input data
        expect(retrievedUser).toHaveProperty('id', user.id);
        expect(retrievedUser).toHaveProperty('firstName', user.firstName);
        expect(retrievedUser).toHaveProperty('lastName', user.lastName);
        expect(retrievedUser).toHaveProperty('emailAddress', user.emailAddress);
      } finally {
        // Remove test user after test is completed
        await repository.delete(user);
      }
    });

    it.todo(
      'should return relations along with found user when such are included'
    );
  });

  test('create method should create new user and return its ID', async () => {
    // Setup service
    const { repository, service } = setupService();

    // Generate test user data and create it through service
    const userData = generateTestUserDto();
    userData.id = await service.create(userData);

    // Convert DTO to user
    const user = userData.toEntity();

    try {
      // Attempt to retrieve user
      const retrievedUser = await repository.findById(user.id, false);

      // Expect user to have been found
      expect(retrievedUser).not.toBeNull();

      // Expect retrieved user to match input data
      expect(retrievedUser).toHaveProperty('id', user.id);
      expect(retrievedUser).toHaveProperty('firstName', user.firstName);
      expect(retrievedUser).toHaveProperty('lastName', user.lastName);
      expect(retrievedUser).toHaveProperty('emailAddress', user.emailAddress);
    } finally {
      // Remove test user after test is completed
      await repository.delete(user);
    }
  });

  test('update method should apply requested updates to user', async () => {
    // Setup service
    const { repository, service } = setupService();

    // Generate test user
    const user = generateTestUser();
    user.id = await repository.create(user);

    try {
      // Generate DTO for update data
      const updateData = generateTestUserDto();

      // Update user through service
      await service.update(user.id, updateData);

      // Retrieve updated user through service
      const updatedUser = await repository.findById(user.id, false);

      // Expect user to have been found
      expect(updatedUser).not.toBeNull();

      // Expect retrieved user to match input data
      expect(updatedUser).toHaveProperty('id', user.id);
      expect(updatedUser).toHaveProperty('firstName', updateData.firstName);
      expect(updatedUser).toHaveProperty('lastName', updateData.lastName);
      expect(updatedUser).toHaveProperty(
        'emailAddress',
        updateData.emailAddress
      );
    } finally {
      // Remove test user after test is completed
      await repository.delete(user);
    }
  });

  test('delete method should remove user with ID if they exist', async () => {
    // Setup service
    const { repository, service } = setupService();

    // Generate test user
    const user = generateTestUser();
    user.id = await repository.create(user);

    try {
      // Attempt to delete user
      await service.delete(user.id);

      // Expect attempt to retrieve user by ID to fail
      await expect(
        (async () => repository.findById(user.id, false))()
      ).resolves.toBeNull();
    } finally {
      // Remove test user after test is completed, if it still exists
      await repository.delete(user);
    }
  });

  describe('verifyCredentials method', () => {
    it("should return false if user with given email doesn't exist", async () => {
      // Setup service
      const { service } = setupService();

      // Define email and password of nonexistent user
      const emailAddress = internet.email();
      const password = internet.password();

      // Expect verifyCredentials method to resolve to false
      const result = await service.verifyCredentials(emailAddress, password);
      expect(result).toBeFalsy();
    });

    it('should return false if password is incorrect', async () => {
      // Setup service
      const { repository, service } = setupService();

      // Generate two different passwords
      const passwordA = internet.password(16);
      const passwordB = internet.password(20);

      // Generate test user
      const user = generateTestUser(passwordA);
      user.id = await repository.create(user);

      try {
        // Expect verifyCredentials method to resolve to false when using second password
        const result = await service.verifyCredentials(
          user.emailAddress,
          passwordB
        );
        expect(result).toBeFalsy();
      } finally {
        // Remove test user when test is completed
        await repository.delete(user);
      }
    });

    it('should return true if credentials are valid', async () => {
      // Setup service
      const { repository, service } = setupService();

      // Generate password
      const password = internet.password();

      // Generate test user
      const user = generateTestUser(password);
      user.id = await repository.create(user);

      try {
        // Expect verifyCredentials method to resolve to true
        const result = await service.verifyCredentials(
          user.emailAddress,
          password
        );
        expect(result).toBeTruthy();
      } finally {
        // Remove test user when test is completed
        await repository.delete(user);
      }
    });
  });
});
