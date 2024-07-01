import { createRouter, useBase } from 'h3';

import courses from './api/courses.ts';
import users from './api/users.ts';

const routes = createRouter();

// Forward API routes to respective handlers
routes.use('/api/courses', useBase('/api', courses.handler));
routes.use('/api/courses/**', useBase('/api', courses.handler));
routes.use('/api/users/**', useBase('/api', users.handler));

export default routes;
