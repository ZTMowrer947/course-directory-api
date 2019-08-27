// Imports
import User from "../database/entities/User.entity";

// DTO
export default class UserModifyDTO implements Partial<User> {
    public firstName!: string;

    public lastName!: string;

    public emailAddress!: string;

    public password!: string;
}
