// Imports
import { useContainer as routingUseContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection, useContainer as ormUseContainer } from 'typeorm';

import ormBootstrap from './database';

// Define variable to hold connection
let connection: Connection;

// Run before all tests
beforeAll(async () => {
  // Setup TypeDI container
  ormUseContainer(Container);
  routingUseContainer(Container);

  // Setup database connection
  connection = await ormBootstrap();
});

// Run after all tests
afterAll(async () => {
  // Close database connection
  await connection.close();
});
