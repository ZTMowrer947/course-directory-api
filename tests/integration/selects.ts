import type { Prisma } from '@prisma/client';
import argon2 from 'argon2';

import type { CourseInputData } from '~/validation/course';
import type { UserInputData } from '~/validation/user.ts';

export async function userFromInput(input: UserInputData) {
  return {
    ...input,
    password: await argon2.hash(input.password),
  } satisfies Prisma.UserCreateInput;
}

export async function userWithCourses(
  input: UserInputData,
  courses: CourseInputData[]
) {
  const userCreateInputBase = await userFromInput(input);

  return {
    ...userCreateInputBase,
    courses: {
      createMany: {
        data: courses,
      },
    },
  } satisfies Prisma.UserCreateInput;
}
