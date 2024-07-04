import type { PrismaClient } from '@prisma/client';
import { createContainer, InjectionMode } from 'awilix';

import type { ICourseService } from './services/course';

export interface RootDeps {
  prisma: PrismaClient;
  courseService: ICourseService;
}

export type FullDeps = RootDeps;

export const container = createContainer<RootDeps>({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});
