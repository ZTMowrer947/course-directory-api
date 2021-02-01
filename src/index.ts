// Imports
import 'reflect-metadata';

import { useContainer as routingUseContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as ormUseContainer } from 'typeorm';

import ormBootstrap from '@/database';

// Configure TypeORM and routing-controllers to use TypeDI container
ormUseContainer(Container);
routingUseContainer(Container);

// Bootstrap TypeORM database connection
console.log('Connecting to database...');
ormBootstrap()
  .then(
    () => {
      console.log('Connection successful. Starting web server...');
      return import('@/app');
    },
    (err: Error) => {
      console.error(
        `Error connecting to database: ${err.stack ?? err.message}`
      );
      process.exit(1);
    }
  )
  .then(
    ({ default: app }) => {
      // Get port to listen on
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

      app.listen(port, () => {
        console.log(`App server now running on port ${port}...`);
      });
    },
    (err: Error) => {
      console.error(`Error starting server: ${err.stack ?? err.message}`);

      process.exit(1);
    }
  );
