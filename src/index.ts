// Imports
import 'reflect-metadata';

import { createDbConnection } from '@/utils/db';

// Connect to database
console.log('Connecting to database...');
createDbConnection()
  .then(
    async () => {
      // If successful, inform user of such
      console.log('Database connection established.');
      console.log('Starting API server....');

      // Dynamically import Express app
      const { default: api } = await import('@/api');

      // Pass it down the chain
      return api;
    },
    (error) => {
      // If database connection failed, log error
      console.error('Failed to connect to database: ', error);

      // Exit with failure status
      process.exit(1);
    }
  )
  .then(
    (api) => {
      // If app import was successful, determine port to listen on
      const port = Number.parseInt(process.env.PORT ?? '5000', 10);

      // Listen on that port
      api.listen(port, () => {
        console.log(`Course directory API now running on port ${port}...`);
      });
    },
    (error) => {
      // If API setup failed, log error
      console.error('Failed to start API server: ', error);

      // Exit with failure status
      process.exit(1);
    }
  );
