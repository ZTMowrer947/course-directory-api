// Imports
import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import EntityBase from "./EntityBase";

// Entity
/**
 * Represents an abstract entity with timestamp properties
 */
abstract class TimestampedEntity extends EntityBase {
    /**
     * The date that the entity was first created.
     */
    @CreateDateColumn({ nullable: false })
    public createdAt!: Date;

    /**
     * The date that the entity was last modified.
     */
    @UpdateDateColumn({ nullable: false })
    public lastModifiedAt!: Date;
}

// Export
export default TimestampedEntity;
