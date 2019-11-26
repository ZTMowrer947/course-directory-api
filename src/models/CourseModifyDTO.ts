// Imports
import { Expose } from "class-transformer";
import { IsNotEmpty, MaxLength } from "class-validator";
import { InputType, Field } from "type-graphql";
import Course from "../database/entities/Course.entity";

// Input Type
@InputType("CourseInput")
export default class CourseModifyDTO implements Partial<Course> {
    @Expose()
    @IsNotEmpty({ message: "title is a required field." })
    @MaxLength(127, {
        message: "title must be no more than 127 characters long.",
    })
    @Field({ nullable: false })
    public title!: string;

    @Expose()
    @IsNotEmpty({ message: "description is a required field." })
    @Field({ nullable: false })
    public description!: string;

    @Expose()
    @Field({ nullable: true })
    public estimatedTime?: string;

    @Expose()
    @Field({ nullable: true })
    public materialsNeeded?: string;
}
