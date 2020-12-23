// Imports
import { internet, name } from 'faker';

import UserDto from '../../dto/user';
import User from '../../entities/user.entity';

// Test utilities
function generateTestUser(password = internet.password()): User {
  const user = new User();
  user.firstName = name.firstName();
  user.lastName = name.lastName();
  user.emailAddress = internet.email(user.firstName, user.lastName);
  user.password = password;

  return user;
}

function generateTestUserDto(password = internet.password()): UserDto {
  const user = generateTestUser(password);

  return new UserDto(user);
}

// Exports
export { generateTestUser, generateTestUserDto };
