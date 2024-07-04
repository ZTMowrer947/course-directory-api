import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import basicAuth from 'basic-auth';

import type { RootDeps } from '~/container.ts';
import { type AuthedUser,userInfo } from '~/selects/user.ts';
import type { UserInputData } from '~/validation/user.ts';

type MaybePromise<T> = T | Promise<T>;

export interface IUserService {
  getUserFromCredentials(credentials: string): MaybePromise<AuthedUser | null>;
  create(input: UserInputData): MaybePromise<AuthedUser>;
}

export class DuplicateEmailError extends Error {
  public constructor() {
    super();
    this.name = 'DuplicateEmailError';
    this.message = 'user with provded email already exists';
  }
}

interface UserServiceDeps {
  prisma: RootDeps['prisma'];
}

export class UserService {
  readonly #prisma: RootDeps['prisma'];

  public constructor({ prisma }: UserServiceDeps) {
    this.#prisma = prisma;
  }

  public async getUserFromCredentials(
    credentials: string
  ): Promise<AuthedUser | null> {
    // Parse header
    const parsedCredentials = basicAuth.parse(credentials);

    if (!parsedCredentials) return null;

    // Attempt to fetch user
    const result = await this.#prisma.user.findUnique({
      where: {
        emailAddress: parsedCredentials.name,
        password: {
          not: '',
        },
      },
      select: {
        ...userInfo(),
        password: true,
      },
    });

    if (!result) return null;

    // If found, verify password
    const { password, ...user } = result;
    const isValid = await argon2.verify(password, parsedCredentials.pass);

    return isValid ? user : null;
  }

  public async create(input: UserInputData): Promise<AuthedUser> {
    const password = await argon2.hash(input.password, {
      parallelism: 4,
      memoryCost: 2 ** 16,
      timeCost: 6,
      type: argon2.argon2id,
    });

    const { firstName, lastName, emailAddress } = input;

    let newUser: AuthedUser;

    try {
      // Attempt to create new user
      newUser = await this.#prisma.user.create({
        data: {
          firstName,
          lastName,
          emailAddress,
          password,
        },
        select: userInfo(),
      });
    } catch (err) {
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError) ||
        err.code !== 'P2002'
      ) {
        throw err;
      }

      throw new DuplicateEmailError();
    }

    return newUser;
  }
}
