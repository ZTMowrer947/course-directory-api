
// Imports
const Sequelize = require("sequelize");

// Database connection setup
const sequelize = new Sequelize({
    // Use SQLite dialect
    dialect: "sqlite",

    // Path to database file
    storage: `${__dirname}/fsjstd-restapi.db`,
});

// Authenticate connection
sequelize.authenticate()
    .then((() => {
        // If the connection is successfully made, log to the console
        console.log("Database connection successfully established.");
    })).catch((error) => {
        // Log any errors to the console
        console.error(`Database connection error: ${error.message}`);

        // Exit with failure status
        process.exit(1);
    });

// Export
module.exports = sequelize;