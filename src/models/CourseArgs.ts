// Imports
import { ArgsType, Field, ID } from "type-graphql";

// Args type
@ArgsType()
export default class CourseArgs {
    @Field(() => ID, { nullable: false })
    public id!: string;
}
