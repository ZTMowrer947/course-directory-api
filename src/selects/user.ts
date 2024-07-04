import type { Prisma } from '@prisma/client';

export function userInfo() {
  return {
    id: true,
    firstName: true,
    lastName: true,
    emailAddress: true,
  } satisfies Prisma.UserSelect;
}
