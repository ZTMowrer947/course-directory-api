// Imports
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class SwitchFromTimestampsToVersion1587675450017
  implements MigrationInterface {
  name = 'SwitchFromTimestampsToVersion1587675450017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove timestamp fields from tables
    await queryRunner.dropColumn('users', 'createdAt');
    await queryRunner.dropColumn('users', 'lastModifiedAt');

    await queryRunner.dropColumn('courses', 'createdAt');
    await queryRunner.dropColumn('courses', 'lastModifiedAt');

    // Create version column
    const versionColumn = new TableColumn({
      type: 'integer',
      name: 'version',
      isNullable: false,
      default: '1',
    });

    // Add version column to tables
    await queryRunner.addColumn('users', versionColumn);
    await queryRunner.addColumn('courses', versionColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove version field from tables
    await queryRunner.dropColumn('users', 'version');
    await queryRunner.dropColumn('courses', 'version');

    // Create timestamp columns
    const createdAtColumn = new TableColumn({
      name: 'createdAt',
      type: 'datetime',
      isNullable: false,
      default: "datetime('now')",
    });

    const lastModifiedAtColumn = new TableColumn({
      name: 'lastModifiedAt',
      type: 'datetime',
      isNullable: false,
      default: "datetime('now')",
    });

    // Add timestamp columns to tables
    await queryRunner.addColumns('users', [
      createdAtColumn,
      lastModifiedAtColumn,
    ]);

    await queryRunner.addColumns('courses', [
      createdAtColumn,
      lastModifiedAtColumn,
    ]);
  }
}
