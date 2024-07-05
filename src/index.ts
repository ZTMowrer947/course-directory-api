import { createServer } from 'node:http';

import { asClass, asValue } from 'awilix';
import { toNodeListener } from 'h3';
import prexit from 'prexit';

import initApp from './app.ts';
import { container } from './container.ts';
import { prisma } from './prisma-client.ts';
import { CourseService } from './services/course.ts';
import { UserService } from './services/user.ts';

// Set DI dependencies for root container
container.register({
  prisma: asValue(prisma),
  courseService: asClass(CourseService).scoped(),
  userService: asClass(UserService).scoped(),
});

// Setup HTTP server
const app = initApp(container);
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
