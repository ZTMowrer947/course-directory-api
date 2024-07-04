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

type CoursePayloadOf<T extends (...args: unknown[]) => Prisma.CourseSelect> =
  Prisma.CourseGetPayload<{
    select: ReturnType<T>;
  }>;

export type CoursePreview = CoursePayloadOf<typeof coursePreview>;
export type CourseDetail = CoursePayloadOf<typeof courseDetail>;
