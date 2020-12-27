// Imports
import express from 'express';

import v1Api from './v1';
import v2Routes from './v2/routes';

// Express app setup
const api = express();

// Configuration
api.disable('x-powered-by');

// Middleware

// Routing
api.use('/api', v1Api);
api.use('/api/v1', v1Api);
api.use('/api/v2', v2Routes);

// Exports
export default api;
