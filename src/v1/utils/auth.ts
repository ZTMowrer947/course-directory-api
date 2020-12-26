// Imports
import basicAuth from 'basic-auth';
import { Context } from 'koa';
import { Action, InternalServerError } from 'routing-controllers';

import User from '../../entities/user.entity';
import UserRepository from '../../repos/user';
import UserService from '../../services/user';
import { getDbConnection } from '../../utils/db';

// Auth Checker
const authorizationChecker = async (action: Action): Promise<boolean> => {
  // Get UserService
  const connection = getDbConnection();
  const repo = connection.getCustomRepository(UserRepository);

  const service = new UserService(repo);

  // Get request data
  const { req } = action.context as Context;

  // Parse request body for credentials
  const credentials = basicAuth(req);

  // If credentials were not found, deny access
  if (!credentials) return false;

  // Otherwise, verify credentials through service
  return service.verifyCredentials(credentials.name, credentials.pass);
};

// Current user checker
const currentUserChecker = async (
  action: Action
): Promise<User | undefined> => {
  // Get database connection
  const connection = getDbConnection();

  // Get request data
  const { req } = action.context as Context;

  // Parse request body for credentials
  const credentials = basicAuth(req);

  // If credentials were not found, throw 500 error
  if (!credentials)
    throw new InternalServerError(
      'Credentials not present on authorized request.'
    );

  // Otherwise, verify credentials through service
  return connection.manager.findOne(User, {
    emailAddress: credentials.name,
  });
};

// Exports
export { authorizationChecker, currentUserChecker };
