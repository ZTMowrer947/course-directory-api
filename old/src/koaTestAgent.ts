// Imports
import http from "http";
import Koa from "koa";
import supertest from "supertest";

// Agent setup
const agent = (app: Koa): supertest.SuperTest<supertest.Test> => {
    // Create HTTP server for koa app
    const server = http.createServer(app.callback());

    // Return supertest agent for HTTP server
    return supertest.agent(server);
};

// Export
export default agent;
