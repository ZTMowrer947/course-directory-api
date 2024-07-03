import { container } from '~/container.ts';

export default function usePrisma() {
  return container.resolve('prisma');
}
