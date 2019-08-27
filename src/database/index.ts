// Imports
import { Container } from "typedi";
import { createConnection, useContainer, Connection } from "typeorm";
import env from "../env";
import seed from "./seed";

// Connection factory
const ormBootstrap = async (): Promise<Connection> => {
    // Configure TypeORM to use TypeDI container
    useContainer(Container);

    // Create database connection
    const connection = await createConnection();

    // Seed database if not in production
    if (env !== "production") {
        await seed(connection);
    }

    // Return connection
    return connection;
};

// Export
export default ormBootstrap;
