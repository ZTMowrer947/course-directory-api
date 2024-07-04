import type { AwilixContainer } from 'awilix';
import { createApp, eventHandler } from 'h3';

import type { RootDeps } from './container.ts';
import routes from './routes.ts';

export default function initApp(container: AwilixContainer<RootDeps>) {
  const app = createApp();

  // Create scope for DI injections
  app.use(
    eventHandler((event) => {
      event.context.scope = container.createScope();
    })
  );

  // Handle routing
  app.use(routes);

  return app;
}

type FullDeps = RootDeps;

// Augment context to include DI scope
declare module 'h3' {
  interface H3EventContext {
    scope: AwilixContainer<FullDeps>;
  }
}
