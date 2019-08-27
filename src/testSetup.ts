// Imports
import { Connection } from "typeorm";
import ormBootstrap from "./database";

// Define variable to hold connection
let connection: Connection;

// Run before all tests
beforeAll(async () => {
    // Setup database connection
    connection = await ormBootstrap();
});

// Run after all tests
afterAll(async () => {
    // Close database connection
    await connection.close();
});
