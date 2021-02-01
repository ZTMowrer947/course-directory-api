// Imports
import { useContainer as routingUseContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { getConnection, useContainer as ormUseContainer } from 'typeorm';
import ormBootstrap from './database';

// Run before all tests
beforeAll(async () => {
  // Configure TypeORM and routing-controllers to use TypeDI container
  ormUseContainer(Container);
  routingUseContainer(Container);

  // Setup database connection
  await ormBootstrap();
});

// Run after all tests
afterAll(async () => {
  const connection = getConnection();

  // Close database connection
  await connection.close();
});
