"use strict";

// Imports
const express = require("express");
const morgan = require("morgan");

// Whether or not a enable error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// Express app setup
const app = express();

// Middleware
app.use(morgan("dev")); // Log HTTP requests

// Routes
// TODO: Setup routes for API

// /: Friendly welcome message
app.get('/', (req, res) => {
    // Respond with welcome message
    res.json({
        message: "Welcome to the REST API project!",
    });
});

// All other routes are a 404
app.use((req, res) => {
    // Set status to 404 and respond with "not found" message
    res.status(404).json({
        message: 'Route Not Found',
    });
});

// Error Handlers
app.use((err, req, res, next) => {
    // If we should log errors,
    if (enableGlobalErrorLogging) {
        // Log the error to the console
        console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
    }

    // Set error status and respond with error message
    res.status(err.status || 500).json({
        message: err.message,
        error: {},
    });
});

// Set port to listen on
app.set('port', process.env.PORT || 5000);

// Listed on app port
const server = app.listen(app.get('port'), () => {
    console.log(`Express server is listening on port ${server.address().port}`);
});
