// Imports
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

// Migration
export default class Initial1566862777462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tables
    const userTable = new Table({
      name: 'users',
      columns: [
        {
          type: 'varchar',
          name: 'id',
          isPrimary: true,
          isNullable: false,
          length: '16',
        },
        {
          // Column name
          name: 'createdAt',

          // Columnn type
          type: 'datetime',

          // Non-nullable
          isNullable: false,

          // Default value
          default: "datetime('now')",
        },
        {
          // Column name
          name: 'lastModifiedAt',

          // Columnn type
          type: 'datetime',

          // Non-nullable
          isNullable: false,

          // Default value
          default: "datetime('now')",
        },
        {
          type: 'varchar',
          name: 'firstName',
          isNullable: false,
          length: '96',
        },
        {
          type: 'varchar',
          name: 'lastName',
          isNullable: false,
          length: '96',
        },
        {
          type: 'varchar',
          name: 'emailAddress',
          isUnique: true,
          isNullable: false,
          length: '127',
        },
        {
          type: 'varchar',
          name: 'password',
          isNullable: false,
        },
      ],
    });

    const courseTable = new Table({
      name: 'courses',
      columns: [
        {
          type: 'varchar',
          name: 'id',
          isPrimary: true,
          isNullable: false,
          length: '16',
        },
        {
          // Column name
          name: 'createdAt',

          // Columnn type
          type: 'datetime',

          // Non-nullable
          isNullable: false,

          // Default value
          default: "datetime('now')",
        },
        {
          // Column name
          name: 'lastModifiedAt',

          // Columnn type
          type: 'datetime',

          // Non-nullable
          isNullable: false,

          // Default value
          default: "datetime('now')",
        },
        {
          type: 'varchar',
          name: 'title',
          isNullable: false,
          length: '127',
        },
        {
          type: 'text',
          name: 'description',
          isNullable: false,
        },
        {
          type: 'varchar',
          name: 'estimatedTime',
          isNullable: true,
        },
        {
          type: 'varchar',
          name: 'materialsNeeded',
          isNullable: true,
        },
        {
          type: 'varchar',
          name: 'creatorId',
          isNullable: false,
          length: '16',
        },
      ],
    });

    // Foreign keys
    const creatorFk = new TableForeignKey({
      columnNames: ['creatorId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    });

    // Create tables
    await queryRunner.createTable(userTable);
    await queryRunner.createTable(courseTable);

    // Create foreign key
    await queryRunner.createForeignKey(courseTable, creatorFk);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get user and course tables
    const userTable = await queryRunner.getTable('users');
    const courseTable = await queryRunner.getTable('courses');

    // Get foreign key
    const creatorFk = courseTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes('creatorId')
    );

    // Drop foreign key if present
    if (courseTable && creatorFk)
      await queryRunner.dropForeignKey(courseTable, creatorFk);

    // Drop tables if present
    if (courseTable) await queryRunner.dropTable(courseTable);
    if (userTable) await queryRunner.dropTable(userTable);
  }
}
