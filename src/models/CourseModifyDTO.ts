// Imports
import { Expose } from "class-transformer";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";
import Course from "../database/entities/Course.entity";

// Class
export default class CourseModifyDTO implements Partial<Course> {
    @Expose()
    @IsNotEmpty({ message: "title is a required field." })
    @MaxLength(127, {
        message: "title must be no more than 127 characters long.",
    })
    public title!: string;

    @Expose()
    @IsNotEmpty({ message: "description is a required field." })
    public description!: string;

    @Expose()
    @MinLength(1, { message: "estimatedTime must not be empty if defined" })
    public estimatedTime?: string;

    @Expose()
    @MinLength(1, { message: "materialsNeeded must not be empty if defined" })
    public materialsNeeded?: string;
}
