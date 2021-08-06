// Imports
import { Column, Entity, ManyToOne } from 'typeorm';

import User from '@/database/entities/User';
import VersionedEntity from '@/database/entities/VersionedEntity';

// Entity
@Entity('courses')
export default class Course extends VersionedEntity {
  @Column({ length: 127, nullable: false })
  public title!: string;

  @Column({ type: 'text', nullable: false })
  public description!: string;

  @Column('varchar', { nullable: true, default: null })
  public estimatedTime!: string | null;

  @Column('varchar', { nullable: true, default: null })
  public materialsNeeded!: string | null;

  @ManyToOne(() => User, (user) => user.createdCourses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  public creator!: User;
}
