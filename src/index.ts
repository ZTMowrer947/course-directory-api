// Imports
import http from "http";
import app from "./app";
import ormBootstrap from "./database";

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
