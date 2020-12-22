// Imports
import { VersionColumn } from 'typeorm';

import EntityBase from './base';

// Versioned base entity schema
abstract class VersionedEntity extends EntityBase {
  @VersionColumn()
  version!: number;
}

// Exports
export default VersionedEntity;
