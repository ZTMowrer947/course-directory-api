// Imports
import { PrimaryGeneratedColumn } from 'typeorm';

// Entity base class
abstract class EntityBase {
  @PrimaryGeneratedColumn('increment')
  id!: number;
}

// Exports
export default EntityBase;
export type EntityId = EntityBase['id'];
