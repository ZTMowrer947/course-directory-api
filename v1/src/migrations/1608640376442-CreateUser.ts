// Imports
import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration
class CreateUser1608640376442 implements MigrationInterface {
  name = 'CreateUser1608640376442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL, "firstName" varchar(192) NOT NULL, "lastName" varchar(192) NOT NULL, "emailAddress" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_eea9ba2f6e1bb8cb89c4e672f62" UNIQUE ("emailAddress"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

// Exports
export default CreateUser1608640376442;
