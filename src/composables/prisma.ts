import { prisma } from '~/prisma-client.ts';

export default function usePrisma(): typeof prisma {
  return prisma;
}
