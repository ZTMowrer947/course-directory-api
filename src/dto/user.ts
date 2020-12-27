// Imports
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

import User from '@/entities/user.entity';

import DtoBase from './base';

// User DTO
@Exclude()
class UserDto extends DtoBase<User> implements Partial<User> {
  @Expose()
  @IsNotEmpty({ message: 'First Name is required' })
  firstName!: string;

  @Expose()
  @IsNotEmpty({ message: 'Last Name is required' })
  lastName!: string;

  @Expose()
  @IsNotEmpty({ message: 'Email Address is required' })
  @IsEmail(undefined, { message: 'Email Address must be a valid email' })
  @MaxLength(127, {
    message: 'Email Address must be no more than 127 characters long',
  })
  emailAddress!: string;

  @Expose()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
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
