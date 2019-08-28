/* istanbul ignore file */
// Imports
import { ConnectionOptions } from "typeorm";
import env from "./src/env";

// Export
export default ((): ConnectionOptions => {
    // Consider env type
    switch (env) {
        case "production":
            return {
                // SQLite
                type: "sqlite",

                // Database path
                database: `${__dirname}/dist/database/fsjstd-restapi.db`,

                // Directories for entities and migrations
                entities: [`${__dirname}/dist/database/entities/**/*.js`],
                migrations: [`${__dirname}/dist/database/migrations/**/*.js`],

                // Run migrations
                migrationsRun: true,

                // Logging
                logging: ["error", "warn"],
                logger: "advanced-console",

                // CLI options
                cli: {
                    // Directories for entities and migrations
                    entitiesDir: "dist/database/entities",
                    migrationsDir: "dist/database/migrations",
                },
            };

        case "staging":
            return {
                // SQLite
                type: "sqlite",

                // Database path
                database: ":memory:",

                // Directories for entities and migrations
                entities: [`${__dirname}/src/database/entities/**/*.ts`],

                // Sync DB
                synchronize: true,

                // Disable logging
                logging: false,
            };

        case "development":
            return {
                // SQLite
                type: "sqlite",

                // Database path
                database: `${__dirname}/src/database/fsjstd-restapi.db`,

                // Directories for entities and migrations
                entities: [`${__dirname}/src/database/entities/**/*.ts`],
                migrations: [`${__dirname}/src/database/migrations/**/*.ts`],

                // Run migrations
                migrationsRun: true,

                // Logging
                logging: "all",
                logger: "advanced-console",

                // CLI options
                cli: {
                    // Directories for entities and migrations
                    entitiesDir: "src/database/entities",
                    migrationsDir: "src/database/migrations",
                },
            };
    }
})();
