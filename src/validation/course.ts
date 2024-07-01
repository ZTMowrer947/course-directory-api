import type { Prisma } from '@prisma/client';
import {
  type Describe,
  nonempty,
  nullable,
  object,
  optional,
  string,
} from 'superstruct';

export type CourseInputData = Pick<
  Prisma.CourseCreateInput,
  'title' | 'description' | 'estimatedTime' | 'materialsNeeded'
>;
export const CourseInput: Describe<CourseInputData> = object({
  title: nonempty(string()),
  description: nonempty(string()),
  estimatedTime: optional(nullable(string())),
  materialsNeeded: optional(nullable(string())),
});
