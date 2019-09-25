// Imports
import { classToPlain } from "class-transformer";
import { ValidationError } from "class-validator";
import AppError from "./AppError";

// Error type
export default class InvalidRequestError extends AppError {
    public readonly validationErrors: ValidationError[];

    public constructor(validationErrors: ValidationError[] = []) {
        super(undefined, 400);

        this.validationErrors = validationErrors;
    }

    public toJSON(): object {
        return {
            errors: classToPlain(this.validationErrors),
        };
    }
}
