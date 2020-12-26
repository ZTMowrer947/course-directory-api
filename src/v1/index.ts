// Imports
import Koa from 'koa';
import {
  createKoaServer,
  useContainer as routingUseContainer,
} from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as ormUseContainer } from 'typeorm';

// Setup TypeDI container
ormUseContainer(Container);
routingUseContainer(Container);

// Create Koa application
const v1Api = createKoaServer({
  cors: {
    exposeHeaders: ['Location'],
  },
  classTransformer: true,
}) as Koa;

// Silence app if testing
v1Api.silent = process.env.NODE_ENV === 'staging';

// Export
export default v1Api.callback();
