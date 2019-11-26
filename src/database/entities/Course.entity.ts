// Imports
import { classToPlain, Expose, Type } from "class-transformer";
import { Column, Entity, ManyToOne } from "typeorm";
import { ObjectType, Field } from "type-graphql";
import EntityBase from "./EntityBase";
import TimestampedEntity from "./TimestampedEntity";
import User from "./User.entity";

// Entity
@Entity("courses")
@ObjectType({ implements: EntityBase })
export default class Course extends TimestampedEntity {
    @Expose()
    @Column({ length: 127, nullable: false })
    @Field({ nullable: false })
    public title!: string;

    @Expose()
    @Column({ type: "text", nullable: false })
    @Field({ nullable: false })
    public description!: string;

    @Expose()
    @Column({ nullable: true, default: null })
    @Field({ nullable: true })
    public estimatedTime!: string | null;

    @Expose()
    @Column({ nullable: true, default: null })
    @Field({ nullable: true })
    public materialsNeeded!: string | null;

    @Expose()
    @Type(() => User)
    @ManyToOne(() => User, user => user.createdCourses, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @Field(() => User, { nullable: false })
    public creator!: User;

    /* istanbul ignore next */
    public toJSON(): object {
        return classToPlain(this, { strategy: "excludeAll" });
    }
}
