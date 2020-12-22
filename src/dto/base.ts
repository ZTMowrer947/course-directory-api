// Imports
import EntityBase, { EntityId } from '../entities/base';

// DTO base
abstract class DtoBase<Entity extends EntityBase> {
  id!: EntityId;

  protected constructor(entity?: Entity) {
    if (entity) {
      this.id = entity.id;
    }
  }

  abstract toEntity(): Entity;
}

// Exports
export default DtoBase;
