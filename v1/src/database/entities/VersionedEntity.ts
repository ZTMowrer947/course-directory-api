// Imports
import { VersionColumn } from 'typeorm';

import EntityBase from '@/database/entities/EntityBase';

// Entity
abstract class VersionedEntity extends EntityBase {
  @VersionColumn()
  public version!: number;
}

// Export
export default VersionedEntity;
