// Imports
import { Column, Entity } from 'typeorm';

import VersionedEntity from './versioned-base';

// Entity
@Entity()
class User extends VersionedEntity {
  @Column({ nullable: false, length: 192 })
  firstName!: string;

  @Column({ nullable: false, length: 192 })
  lastName!: string;

  @Column({ nullable: false, unique: true })
  emailAddress!: string;

  @Column({ nullable: false, select: false })
  password!: string; // TODO:ztm Hash before saving
}

// Exports
export default User;
