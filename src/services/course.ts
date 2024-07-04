import type { Course } from '@prisma/client';

import type { RootDeps } from '~/container.ts';
import {
  type CourseDetail,
  courseDetail,
  type CoursePreview,
  coursePreview,
} from '~/selects/course.ts';
import type { AuthedUser } from '~/selects/user.ts';
import type { CourseInputData } from '~/validation/course.ts';

type MaybePromise<T> = T | Promise<T>;

// Service interface
export interface ICourseService {
  getAll(): MaybePromise<CoursePreview[]>;
  get(id: Course['id']): MaybePromise<CourseDetail | null>;
  create(input: CourseInputData, user: AuthedUser): MaybePromise<CourseDetail>;
  update(course: CourseDetail, input: CourseInputData): MaybePromise<void>;
  delete(course: CourseDetail): MaybePromise<void>;
}

// Prisma-back service implementation
interface CourseServiceDeps {
  prisma: RootDeps['prisma'];
}

export class CourseService implements ICourseService {
  readonly #prisma: RootDeps['prisma'];

  public constructor({ prisma }: CourseServiceDeps) {
    this.#prisma = prisma;
  }

  public async getAll(): Promise<CoursePreview[]> {
    return this.#prisma.course.findMany({
      select: coursePreview(),
    });
  }

  public async get(id: Course['id']): Promise<CourseDetail | null> {
    return this.#prisma.course.findUnique({
      where: {
        id,
      },
      select: courseDetail(),
    });
  }

  public async create(
    input: CourseInputData,
    user: AuthedUser
  ): Promise<CourseDetail> {
    return this.#prisma.course.create({
      data: {
        ...input,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      select: courseDetail(),
    });
  }

  public async update(
    course: CourseDetail,
    input: CourseInputData
  ): Promise<void> {
    await this.#prisma.course.update({
      where: {
        id: course.id,
      },
      data: input,
    });
  }

  public async delete(course: CourseDetail): Promise<void> {
    await this.#prisma.course.delete({
      where: {
        id: course.id,
      },
    });
  }
}
