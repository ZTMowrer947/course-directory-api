// Imports
import User from '../entities/user.entity';
import DtoBase from './base';

// User DTO
class UserDto extends DtoBase<User> implements Partial<User> {
  firstName!: string;

  lastName!: string;

  emailAddress!: string;

  password!: string;

  constructor(user?: User) {
    super(user);

    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.emailAddress = user.emailAddress;
      this.password = user.password;
    }
  }

  toEntity(): User {
    const user = new User();
    user.id = this.id;
    user.firstName = this.firstName;
    user.lastName = this.lastName;
    user.emailAddress = this.emailAddress;
    user.password = this.password;

    return user;
  }
}

// Exports
export default UserDto;
