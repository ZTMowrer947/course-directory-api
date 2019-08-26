"use strict";

// Imports
import http from "http";
import app from "./app";

// HTTP Server setup
const server = http.createServer(app);

// Listening on specified port
server.listen(app.get("port"), () => {
    console.log(`Express server is listening on port ${app.get("port")}`);
});

// When recieving CTRL-C,
process.on("SIGINT", () => {
    // Display shutting down message
    console.log("Shutting down express server...");

    // Close HTTP server
    server.close(() => {
        // Display shutdown message
        console.log("Shutdown complete.");

        // Exit with success status
        process.exit(0);
    });
});
