// Imports
import { Column, Entity, OneToMany } from "typeorm";
import TimestampedEntity from "./TimestampedEntity";
import Course from "./Course.entity";

// Entity
@Entity("users")
export default class User extends TimestampedEntity {
    @Column({ length: 96, nullable: false })
    public firstName!: string;

    @Column({ length: 96, nullable: false })
    public lastName!: string;

    @Column({ length: 127, nullable: false, unique: true })
    public emailAddress!: string;

    @Column({ nullable: false })
    public password!: string;

    @OneToMany(() => Course, course => course.creator)
    public createdCourses!: Course[];
}
