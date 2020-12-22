// Imports
import argon2 from 'argon2';
import os from 'os';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

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
  password!: string;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPasswordBeforeUpsert(): Promise<void> {
    // Hash password using argon2
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      hashLength: 48,
      timeCost: 12,
      memoryCost: 2 ** 16,
      parallelism: os.cpus().length,
    });
  }
}

// Exports
export default User;
