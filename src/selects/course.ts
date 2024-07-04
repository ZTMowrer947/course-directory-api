import type { Prisma } from '@prisma/client';

export function coursePreview() {
  return {
    id: true,
    title: true,
  } satisfies Prisma.CourseSelect;
}

export function courseDetail() {
  return {
    id: true,
    title: true,
    description: true,
    estimatedTime: true,
    materialsNeeded: true,
    userId: true,
    user: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  } satisfies Prisma.CourseSelect;
}
