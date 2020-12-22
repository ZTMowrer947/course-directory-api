// Imports
import DtoBase from '../dto/base';
import EntityBase, { EntityId } from '../entities/base';
import { IRepository, TypeOrPromise } from '../repos/base';

// Base service interface
interface IService<Entity extends EntityBase, Dto extends DtoBase<Entity>> {
  readonly repository: IRepository<Entity>;

  getAll(): TypeOrPromise<Entity[]>;

  getById(id: EntityId, includeRelations: boolean): TypeOrPromise<Entity>;

  create(entityData: Dto): TypeOrPromise<EntityId>;

  update(id: EntityId, entityData: Dto): TypeOrPromise<void>;

  delete(id: EntityId): TypeOrPromise<void>;
}

// Base service
abstract class BaseService<
  Entity extends EntityBase,
  Dto extends DtoBase<Entity>
> implements IService<Entity, Dto> {
  readonly repository: IRepository<Entity>;

  protected constructor(repository: IRepository<Entity>) {
    this.repository = repository;
  }

  getAll(): TypeOrPromise<Entity[]> {
    return this.repository.findAll();
  }

  async getById(id: number, includeRelations: boolean): Promise<Entity> {
    // Attempt to retrieve entity through repository
    const entity = await this.repository.findById(id, includeRelations);

    // If entity was not found,
    if (!entity) {
      // Throw error
      throw new Error(`Entity not found with ID "${id}."`);
    }

    // Otherwise, return entity
    return entity;
  }

  create(entityData: Dto): TypeOrPromise<EntityId> {
    // Convert DTO to entity
    const entity = entityData.toEntity();

    // Create entity through repository
    return this.repository.create(entity);
  }

  update(id: number, entityData: Dto): TypeOrPromise<void> {
    // Convert DTO to entity
    const entity = entityData.toEntity();

    // Update entity through repository
    return this.repository.update(id, entity);
  }

  async delete(id: number): Promise<void> {
    // Attempt to retrieve entity through repository
    const entity = await this.repository.findById(id, false);

    // If the entity does exist,
    if (entity) {
      // Delete it through repository
      await this.repository.delete(entity);
    }
  }
}

// Exports
export default BaseService;
export type { IService };
