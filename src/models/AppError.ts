// Imports
import env from "../env";
import JSONSerializable from "./JSONSerializable";

// Error type
export default class AppError extends Error implements JSONSerializable {
    public readonly status: number;

    public constructor(message = "", status = 500) {
        super(message);

        this.status = status;
    }

    public toJSON(): object {
        return {
            message: this.message,
            stack: env !== "production" ? this.stack : undefined,
        };
    }
}
