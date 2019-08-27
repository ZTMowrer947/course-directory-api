// Imports
import "reflect-metadata";
import http from "http";
import app from "./app";
import ormBootstrap from "./database";

// HTTP Server setup
const server = http.createServer(app);

// Initialize database connection
ormBootstrap().then(() => {
    // Listen on specified port
    server.listen(app.get("port"), () => {
        console.log(`Express server is listening on port ${app.get("port")}`);
    });
});
