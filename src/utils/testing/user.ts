// Imports
import { plainToClass } from 'class-transformer';
import { internet, name } from 'faker';

import User from '@/database/entities/User';
import UserModifyDTO from '@/models/UserModifyDTO';

// Test utilities
function generateTestUserData() {
  const firstName = name.firstName();
  const lastName = name.lastName();
  const emailAddress = internet.email(firstName, lastName);
  const password = internet.password(24);

  return {
    firstName,
    lastName,
    emailAddress,
    password,
  };
}

function generateTestUserDto(): UserModifyDTO {
  return plainToClass(UserModifyDTO, generateTestUserData());
}

function generateTestUser(): User {
  return plainToClass(User, generateTestUserData());
}

// Exports
export { generateTestUser, generateTestUserDto };
