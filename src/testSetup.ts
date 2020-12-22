// Imports
import { createDbConnection, getDbConnection } from './utils/db';

// Setup and Teardown
beforeAll(async () => {
  // Initialize database connection
  await createDbConnection();
});

afterAll(async () => {
  // Retrieve open database connection
  const connection = getDbConnection();

  // Close it
  await connection.close();
});
