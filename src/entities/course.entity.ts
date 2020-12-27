/* eslint-disable import/no-cycle */
// Imports
import { Column, Entity, ManyToOne } from 'typeorm';

import User from './user.entity';
import VersionedEntity from './versioned-base';

// Entity
@Entity()
class Course extends VersionedEntity {
  @Column({ nullable: false, unique: true })
  title!: string;

  @Column('text', { nullable: false })
  description!: string;

  @Column({ nullable: true })
  estimatedTime!: string | null;

  @Column('text', { nullable: true })
  materialsNeeded!: string | null;

  @ManyToOne(() => User, (user) => user.createdCourses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  creator!: User;
}

// Exports
export default Course;
