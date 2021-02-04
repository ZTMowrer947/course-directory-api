// Imports
import { Connection, createConnection } from 'typeorm';

import seed from '@/database/seed';
import env from '@/env';

// Connection factory
const ormBootstrap = async (): Promise<Connection> => {
  // Create database connection
  const connection = await createConnection(env);

  // Seed database if not in production
  if (env !== 'production') {
    await seed(connection);
  }

  // Return connection
  return connection;
};

// Export
export default ormBootstrap;
