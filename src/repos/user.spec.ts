// Imports
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
    it.todo('should return null if user cannot be found');

    it.todo(
      'should only return the user when found and relations are excluded'
    );

    it.todo(
      'should return relations along with found user when such are included'
    );
  });

  test.todo('create method should persist user and return its new ID');

  test.todo('update method should persist requested updates');

  test.todo('delete method should irrecoverably delete user');
});
