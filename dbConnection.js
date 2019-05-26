
// Imports
const Sequelize = require("sequelize");

// Declare variable for if we are testing
let testing = process.env.NODE_ENV.startsWith("test");

// Declare env-dependent options
let storage;
let logging;

// If we are doing testing,
if (testing) {
    // Set storage location to memory
    storage = ":memory:";

    // Disable logging
    logging = false;
} else {
    // Otherwise, set storage to database file
    storage = `${__dirname}/fsjstd-restapi.db`;

    // Log to console
    logging = console.log;
}

console.log(logging);

// Database connection setup
const sequelize = new Sequelize({
    // Use SQLite dialect
    dialect: "sqlite",

    // Path to database storage
    storage: storage,
    
    logging,
});

// Authenticate connection
sequelize.authenticate()
    .then((() => {
        // Log only if not testing
        if (!testing)
            // If the connection is successfully made, log to the console
            console.log("Database connection successfully established.");
    })).catch((error) => {
        // Log only if not testing
        if (!testing)
            // Log any errors to the console
            console.error(`Database connection error: ${error.message}`);

        // Exit with failure status
        process.exit(1);
    });

// Synchronize database
sequelize.sync();

// Export
module.exports = sequelize;