import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import YAML from 'yaml';

const prisma = new PrismaClient();
const seederFilePath = path.join(__dirname, 'seeder_data.yaml');

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  parallelism: os.cpus().length,
  timeCost: 10,
};

interface YamlCourse {
  userId: number;
  title: string;
  description: string;
  estimatedTime?: string;
  materialsNeeded?: string;
}

interface YamlUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
}

interface SeederData {
  users: YamlUser[];
  courses: YamlCourse[];
}

async function main() {
  // Check for user
  const firstUser = await prisma.user.findFirst();

  // If the database has any users, no seeding is required
  if (firstUser) return;

  // CHeck for course
  const firstCourse = await prisma.course.findFirst();

  // If database has any courses, no seeding is required
  if (firstCourse) return;

  const seederFile = YAML.parse(
    await fs.readFile(seederFilePath, { encoding: 'utf-8' })
  ) as SeederData;

  // Map each password to a hashing operation
  const passwordHashings = seederFile.users.map(({ password }) =>
    argon2.hash(password, hashOptions)
  );

  // Hash all passwords before proceeding
  const hashedPasswords = await Promise.all(passwordHashings);

  // Map each user to a creation operation
  const userSeedings = seederFile.users.map((user, idx) => {
    const tempId = idx + 1;

    const courses = seederFile.courses
      .filter((course) => course.userId === tempId)
      .map(({ userId, ...course }) => course);

    const password = hashedPasswords[idx]!;

    return prisma.user.upsert({
      where: { emailAddress: user.emailAddress },
      update: {},
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password,
        courses: {
          create: courses,
        },
      },
    });
  });

  // Run all seed operations
  await Promise.all(userSeedings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
