// Imports
import argon2 from 'argon2';
import { getRepository } from 'typeorm';
import User from '../../database/entities/User';
import UserService from '../UserService';
import UserModifyDTO from '../../models/UserModifyDTO';
import env from '../../env';

// Test Suite
describe('User service', () => {
  let userService: UserService;
  let userData: UserModifyDTO;

  // Run before all tests
  beforeAll(() => {
    // Get user repository
    const repository = getRepository(User, env);

    // Initialize user service
    userService = new UserService(repository);

    // Define user data
    userData = new UserModifyDTO();
    userData.firstName = 'Examply';
    userData.lastName = 'Exampleton';
    userData.emailAddress = 'exampleton@test.tld';
    userData.password = 'examplepass';
  });

  describe('create method', () => {
    it('should create a user', async () => {
      // Create user and expect no errors
      await expect(userService.create(userData)).resolves.toBeUndefined();
    });
  });

  describe('getUserByEmail method', () => {
    it('should return a user with a matching email', async () => {
      // Find user by email
      const user = await userService.getUserByEmail(userData.emailAddress);

      // Expect user to be defined
      expect(user).toBeDefined();

      // Expect user to match input data
      expect(user!.firstName).toBe(userData.firstName);
      expect(user!.lastName).toBe(userData.lastName);
      expect(user!.emailAddress).toBe(userData.emailAddress);
      await expect(
        argon2.verify(user!.password, userData.password)
      ).resolves.toBeTruthy();
    });

    it("should return undefined if a user with a matching email wasn't found", async () => {
      // Define unused email
      const unusedEmail = 'unused@example.tld';

      // Attempt to fetch user by email
      const user = await userService.getUserByEmail(unusedEmail);

      // Expect user to be undefined
      expect(user).toBeUndefined();
    });
  });
});
