// Imports
import { Container } from 'typedi';
import { getConnection, useContainer as ormUseContainer } from 'typeorm';
import ormBootstrap from './database';

// Run before all tests
beforeAll(async () => {
  // Setup TypeDI container
  ormUseContainer(Container);

  // Setup database connection
  await ormBootstrap();
});

// Run after all tests
afterAll(async () => {
  const connection = getConnection();

  // Close database connection
  await connection.close();
});
