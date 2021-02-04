// Imports
import argon2 from 'argon2';
import os from 'os';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

import Course from '@/database/entities/Course';
import VersionedEntity from '@/database/entities/VersionedEntity';

// Entity
@Entity('users')
export default class User extends VersionedEntity {
  @Column({ length: 96, nullable: false })
  public firstName!: string;

  @Column({ length: 96, nullable: false })
  public lastName!: string;

  @Column({ length: 127, nullable: false, unique: true })
  public emailAddress!: string;

  @Column({ nullable: false, select: false })
  public password!: string;

  @OneToMany(() => Course, (course) => course.creator)
  public createdCourses!: Course[];

  /* istanbul ignore next */
  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      hashLength: 48,
      parallelism: os.cpus.length > 2 ? os.cpus.length - 2 : 1,
      memoryCost: 2 ** 16,
    });
  }
}
