import { createServer } from 'node:http';

import { toNodeListener } from 'h3';
import prexit from 'prexit';

import app from './app.ts';

// Setup HTTP server
const server = createServer(toNodeListener(app));

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
