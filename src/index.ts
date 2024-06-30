import { createServer } from 'node:http';

import { createApp, fromNodeMiddleware, toNodeListener } from 'h3';
import prexit from 'prexit';

import koaApp from './koa/app.ts';
import routes from './routes.ts';

const h3App = createApp();

h3App.use(routes);

// Send incoming requests to Koa app for now
h3App.use(fromNodeMiddleware(koaApp.callback()));

// Setup HTTP server
const server = createServer(toNodeListener(h3App));

server.listen(5000, () => {
  console.log('course-directory-api now running on port 5000');
});

// Shutdown handler
prexit(async () => {
  const closeAsync = () =>
    new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );

  await closeAsync();
});
