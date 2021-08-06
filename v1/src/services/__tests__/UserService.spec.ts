// Imports
import argon2 from 'argon2';
import { internet } from 'faker';
import { getRepository } from 'typeorm';

import User from '@/database/entities/User';
import env from '@/env';
import UserService from '@/services/UserService';
import { generateTestUser, generateTestUserDto } from '@/utils/testing/user';

// Test utilities
function setupService() {
  // Get user repository
  const repository = getRepository(User, env);

  // Initialize user service
  const service = new UserService(repository);

  return { repository, service };
}

// Test Suite
describe('User service', () => {
  test('create method should create a user and make it retrievable', async () => {
    // Setup repository and service
    const { repository, service } = setupService();

    // Generate test user
    const userData = generateTestUserDto();

    // Attempt to persist test user using service
    await service.create(userData);

    try {
      // Find created user through email
      const createdUser = await repository.findOneOrFail(
        {
          emailAddress: userData.emailAddress,
        },
        { select: ['firstName', 'lastName', 'emailAddress', 'password'] }
      );

      // Expect user to match input data
      expect(createdUser).toHaveProperty('firstName', userData.firstName);
      expect(createdUser).toHaveProperty('lastName', userData.lastName);
      expect(createdUser).toHaveProperty('emailAddress', userData.emailAddress);
      expect(createdUser).toHaveProperty('password');
      await expect(
        argon2.verify(createdUser.password, userData.password)
      ).resolves.toBeTruthy();
    } finally {
      // Attempt to find user through email
      const userToCleanup = await repository.findOne({
        emailAddress: userData.emailAddress,
      });

      // If found, remove user
      if (userToCleanup) await repository.remove(userToCleanup);
    }
  });

  describe('findByEmail method', () => {
    it('should retrieve the user with the given email if found', async () => {
      // Setup repository and service
      const { repository, service } = setupService();

      // Generate test user
      const user = generateTestUser();

      // Persist test user
      await repository.save(user);

      try {
        // Attempt to find user through email
        const retrievedUser = await service.findByEmail(user.emailAddress);

        // Expect user to match input data
        expect(retrievedUser).toHaveProperty('firstName', user.firstName);
        expect(retrievedUser).toHaveProperty('lastName', user.lastName);
        expect(retrievedUser).toHaveProperty('emailAddress', user.emailAddress);
        expect(retrievedUser).not.toHaveProperty('password');
      } finally {
        // Remove test user
        await repository.remove(user);
      }
    });

    it('should return undefined if no user exists with the given email', async () => {
      // Setup repository and service
      const { service } = setupService();

      // Generate email of nonexistent user
      const unusedEmail = internet.exampleEmail();

      // Expect attempt to find user by email to fail
      await expect(service.findByEmail(unusedEmail)).resolves.toBeUndefined();
    });
  });
});
