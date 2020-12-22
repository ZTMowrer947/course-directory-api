// Imports
import http from "http";
import { Container } from "typedi";
import { useContainer } from "typeorm";
import app from "./app";
import ormBootstrap from "./database";

// Configure TypeORM to use TypeDI container
useContainer(Container);

// Bootstrap TypeORM database connection
ormBootstrap().then(() => {
    // Create HTTP server
    const server = http.createServer(app.callback());

    // Get port to listen on
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

    // Listen on given port
    server.listen(port);

    server.once("listening", () => {
        console.log(`Koa server now running on port ${port}...`);
    });
});
