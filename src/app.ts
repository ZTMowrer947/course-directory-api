import { createApp } from 'h3';

import routes from './routes.ts';

const app = createApp();

// Handle routing
app.use(routes);

export default app;
