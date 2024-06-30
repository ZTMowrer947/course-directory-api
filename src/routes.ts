import { createRouter, useBase } from 'h3';

import courses from './api/courses.ts';

const routes = createRouter();

// Forward API routes to respective handlers
routes.use('/api/**', useBase('/api', courses.handler));

export default routes;
