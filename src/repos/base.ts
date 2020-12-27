// Imports
import { AbstractRepository } from 'typeorm';

import EntityBase, { EntityId } from '../entities/base';

// Helper types
type TypeOrPromise<T> = T | Promise<T>;

// Base repository interface
interface IRepository<Entity extends EntityBase> {
  findAll(): TypeOrPromise<Entity[]>;
  findById(
    id: EntityId,
    includeRelations: boolean
  ): TypeOrPromise<Entity | null>;
  create(entityData: Entity): TypeOrPromise<EntityId>;
  update(id: EntityId, updateData: Entity): TypeOrPromise<void>;
  delete(entity: Entity): TypeOrPromise<void>;
}

// Base repository
abstract class BaseRepository<Entity extends EntityBase>
  extends AbstractRepository<Entity>
  implements IRepository<Entity> {
  abstract findAll(): TypeOrPromise<Entity[]>;

  abstract findById(
    id: EntityId,
    includeRelations: boolean
  ): TypeOrPromise<Entity | null>;

  create(entityData: Entity): TypeOrPromise<EntityId> {
    // Persist entity
    return this.manager.save(entityData).then(({ id }) => id);
  }

  async update(id: EntityId, updateData: Entity): Promise<void> {
    // Copy entity and attach ID
    const updatedEntity = updateData;
    updatedEntity.id = id;

    // Persist changes to database
    await this.manager.save(updatedEntity);
  }

  async delete(entity: Entity): Promise<void> {
    await this.manager.remove(entity);
  }
}

// Exports
export default BaseRepository;
export type { IRepository, TypeOrPromise };
