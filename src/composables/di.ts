import type { H3Event } from 'h3';

import type { FullDeps } from '~/container.ts';

export function getDependency<K extends keyof FullDeps>(
  event: H3Event,
  key: K
): FullDeps[K] {
  return event.context.scope.resolve(key);
}
