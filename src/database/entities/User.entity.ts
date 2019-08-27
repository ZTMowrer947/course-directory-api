// Imports
import os from "os";
import argon2 from "argon2";
import {
    Column,
    Entity,
    OneToMany,
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
} from "typeorm";
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

    private tempPassword!: string;

    @Column({ nullable: false })
    public password!: string;

    @OneToMany(() => Course, course => course.creator)
    public createdCourses!: Course[];

    @AfterLoad()
    private loadTempPassword(): void {
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    private async hashPassword(): Promise<void> {
        this.password = await argon2.hash(this.password, {
            type: argon2.argon2id,
            hashLength: 48,
            parallelism: os.cpus.length > 2 ? os.cpus.length - 2 : 1,
            memoryCost: 2 ** 16,
        });
    }

    @BeforeUpdate()
    private async hashPasswordIfUpdated(): Promise<void> {
        if (this.password !== this.tempPassword) await this.hashPassword();
    }
}
