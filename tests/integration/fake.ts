import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';
import argon2 from 'argon2';

export function fakeCourses(count = 2) {
  return Array.from({ length: count }, (_, index) => {
    const estimatedTime =
      index % 2 === 0 ? null : `${faker.number.int({ min: 2, max: 10 })} hours`;
    const materialsNeeded =
      index % 2 === 0
        ? null
        : Array.from({ length: 3 }, () => `- ${faker.lorem.words(3)}`).join(
            '\n'
          );

    return {
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      estimatedTime,
      materialsNeeded,
    } satisfies Prisma.CourseCreateManyUserInput;
  });
}

export async function fakeUser() {
  const [firstName, lastName] = [
    faker.person.firstName(),
    faker.person.lastName(),
  ];
  return {
    firstName,
    lastName,
    emailAddress: faker.internet.email({ firstName, lastName }),
    password: await argon2.hash(faker.internet.password({ length: 12 })),
  } satisfies Prisma.UserCreateWithoutCoursesInput;
}
