// Imports
import { Column, Entity, ManyToOne } from "typeorm";
import TimestampedEntity from "./TimestampedEntity";
import User from "./User.entity";

// Entity
@Entity("courses")
export default class Course extends TimestampedEntity {
    @Column({ length: 127, nullable: false })
    public title!: string;

    @Column({ type: "text", nullable: false })
    public description!: string;

    @Column({ nullable: true, default: null })
    public estimatedTime!: string | null;

    @Column({ nullable: true, default: null })
    public materialsNeeded!: string | null;

    @ManyToOne(() => User, user => user.createdCourses, {
        nullable: false,
        onDelete: "CASCADE",
    })
    public creator!: User;

    /* istanbul ignore next */
    public toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            estimatedTime: this.estimatedTime,
            materialsNeeded: this.materialsNeeded,
            creator: this.creator,
        };
    }
}
