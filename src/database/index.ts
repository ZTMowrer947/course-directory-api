// Imports
import { createConnection, Connection } from "typeorm";

// Connection factory
const ormBootstrap = async (): Promise<Connection> => {
    // Create database connection
    const connection = await createConnection();

    // Return connection
    return connection;
};

// Export
export default ormBootstrap;
