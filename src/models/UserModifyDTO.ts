// Imports
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import User from '@/database/entities/User';

// DTO
export default class UserModifyDTO implements Partial<User> {
  @Expose()
  @IsNotEmpty({ message: 'firstName is a required field.' })
  @Matches(/^[A-Za-z0-9.,' ]+$/, {
    message:
      'firstName must only consist of alphanumeric characters and punctuation',
  })
  @MaxLength(96, {
    message: 'firstName must be no more than 96 characters long.',
  })
  public firstName!: string;

  @Expose()
  @IsNotEmpty({ message: 'lastName is a required field.' })
  @Matches(/^[A-Za-z0-9.,' ]+$/, {
    message:
      'lastName must only consist of alphanumeric characters and punctuation',
  })
  @MaxLength(96, {
    message: 'lastName must be no more than 96 characters long.',
  })
  public lastName!: string;

  @Expose()
  @IsNotEmpty({ message: 'emailAddress is a required field.' })
  @IsEmail(undefined, {
    message: 'emailAddress must be a valid email address.',
  })
  @MaxLength(127, {
    message: 'emailAddress must be no more than 127 characters long.',
  })
  public emailAddress!: string;

  @Expose()
  @IsNotEmpty({ message: 'password is a required field.' })
  @MinLength(8, { message: 'password must be at least 8 characters long.' })
  public password!: string;
}
