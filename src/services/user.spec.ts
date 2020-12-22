// Test Suite
describe('User service', () => {
  test.todo('getAll method should not be implemented');

  describe('getById method', () => {
    it.todo('should throw an error if user cannot be found');

    it.todo(
      'should only return the user when found and relations are excluded'
    );

    it.todo(
      'should return relations along with found user when such are included'
    );
  });

  test.todo('create method should create new user and return its ID');

  test.todo('update method should apply requested updates to user');

  test.todo('delete method should remove user with ID if they exist');

  describe('verifyCredentials method', () => {
    it.todo("should return false if user with given email doesn't exist");

    it.todo('should return false if password is incorrect');

    it.todo('should return true if credentials are valid');
  });
});
