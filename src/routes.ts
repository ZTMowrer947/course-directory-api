import { createRouter, useBase } from 'h3';

import courses from './api/courses.ts';
import users from './api/user.ts';

const routes = createRouter();

// Forward API routes to respective handlers
routes.use('/api/**', useBase('/api', courses.handler));
routes.use('/api/**', useBase('/api', users.handler));

export default routes;
