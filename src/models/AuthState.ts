// Imports
import User from "../database/entities/User.entity";
import UserState from "./UserState";

// State
interface AuthState extends UserState {
    user: User;
}

// Export
export default AuthState;
