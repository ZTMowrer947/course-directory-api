// Imports
import basicAuth from 'basic-auth';
import { IncomingMessage } from 'http';
import { Action, InternalServerError } from 'routing-controllers';
import { Container } from 'typedi';

import User from '@/database/entities/User';
import UserService from '@/services/UserService';

// Current User Checker
export default async (action: Action): Promise<User | undefined> => {
  // Get UserService
  const service: UserService = Container.get(UserService);

  // Get request data
  const req = action.request as IncomingMessage;

  // Parse request body for credentials
  const credentials = basicAuth(req);

  // If credentials were not found, throw 500 error
  if (!credentials)
    throw new InternalServerError(
      'Credentials not present on authorized request.'
    );

  // Otherwise, find user by email address
  const user = await service.findByEmail(credentials.name);

  // Return user
  return user;
};
