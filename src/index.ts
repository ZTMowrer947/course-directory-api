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

    // Listen on given port
    server.listen(8000);

    server.once("listening", () => {
        console.log("Koa server now running on port 8000...");
    });
});
