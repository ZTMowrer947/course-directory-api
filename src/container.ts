import type { PrismaClient } from '@prisma/client';
import { createContainer, InjectionMode } from 'awilix';

import type { ICourseService } from './services/course.ts';
import type { IUserService } from './services/user.ts';

export interface RootDeps {
  prisma: PrismaClient;
  courseService: ICourseService;
  userService: IUserService;
}

export type FullDeps = RootDeps;

export const container = createContainer<RootDeps>({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});
