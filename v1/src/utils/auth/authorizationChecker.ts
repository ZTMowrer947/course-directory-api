// Imports
import basicAuth from 'basic-auth';
import { IncomingMessage } from 'http';
import { Action } from 'routing-controllers';
import { Container } from 'typedi';

import UserService from '@/services/UserService';

// Auth Checker
export default async (action: Action): Promise<boolean> => {
  // Get UserService
  const service: UserService = Container.get(UserService);

  // Get request data
  const req = action.request as IncomingMessage;

  // Parse request body for credentials
  const credentials = basicAuth(req);

  // If credentials were not found, deny access
  if (!credentials) return false;

  // Otherwise, use service to verify credentials
  return service.verifyCredentials(credentials.name, credentials.pass);
};
