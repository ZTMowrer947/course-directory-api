// Imports
import express from 'express';

import v2Routes from './v2/routes';

// Express app setup
const api = express();

// Configuration
api.disable('x-powered-by');

// Middleware

// Routing
api.use(v2Routes);

// Exports
export default api;
