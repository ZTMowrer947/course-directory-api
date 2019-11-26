// Imports
import { ParameterizedContext } from "koa";
import User from "../database/entities/User.entity";

// Context
interface GraphQLContext {
    koaCtx: ParameterizedContext;
    user: User;
}

// Export
export default GraphQLContext;
