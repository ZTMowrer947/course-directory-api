import type { PrismaClient } from '@prisma/client';
import { createContainer, InjectionMode } from 'awilix';

export interface RootDeps {
  prisma: PrismaClient;
}

export type FullDeps = RootDeps;

export const container = createContainer<RootDeps>({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});
