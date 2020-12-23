// Imports
import { Router } from 'express';

import userRoutes from './user';

// Router setup
const v2Routes = Router();

// Routes
v2Routes.use('/users', userRoutes);

// Exports
export default v2Routes;
