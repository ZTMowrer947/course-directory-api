import type { User } from '@prisma/client';
import argon2 from 'argon2';
import basicAuth from 'basic-auth';

import usePrisma from './prisma';

export type AuthedUser = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'emailAddress'
>;

export default async function getUser(
  header: string
): Promise<AuthedUser | null> {
  const prisma = usePrisma();

  // Parse header
  const credentials = basicAuth.parse(header);

  if (!credentials) return null;

  // Attempt to fetch user
  const result = await prisma.user.findUnique({
    where: {
      emailAddress: credentials.name,
      password: {
        not: '',
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      emailAddress: true,
      password: true,
    },
  });

  if (!result) return null;

  // If found, verify password
  const { password, ...user } = result;
  const isValid = await argon2.verify(password, credentials.pass);

  return isValid ? user : null;
}
