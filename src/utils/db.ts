// Imports
import { Container } from 'typedi';
import {
  Connection,
  createConnection,
  getConnection,
  useContainer,
} from 'typeorm';

// Setup TypeDI container
useContainer(Container);

// Config name type
type ConfigName = 'development' | 'testing' | 'production';

// Utility functions
function getConfigNameFromEnv(): ConfigName {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'production';

    case 'test':
      return 'testing';

    default:
      return 'development';
  }
}

const getDbConnection = (): Connection => getConnection(getConfigNameFromEnv());

function createDbConnection(): Promise<Connection> {
  const configName = getConfigNameFromEnv();

  return createConnection(configName);
}

// Exports
export { createDbConnection, getConfigNameFromEnv, getDbConnection };
