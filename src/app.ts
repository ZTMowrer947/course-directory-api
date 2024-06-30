import { createApp, fromNodeMiddleware } from 'h3';

import koaApp from './koa/app.ts';
import routes from './routes.ts';

const app = createApp();

// Handle routing
app.use(routes);

// Send other incoming requests to Koa app for now
app.use(fromNodeMiddleware(koaApp.callback()));

export default app;
