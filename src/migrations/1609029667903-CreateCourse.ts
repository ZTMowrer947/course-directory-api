// Imports
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class CreateCourse1609029667903 implements MigrationInterface {
  name = 'CreateCourse1609029667903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "estimatedTime" varchar, "materialsNeeded" text, "creatorId" integer NOT NULL, CONSTRAINT "UQ_ac5edecc1aefa58ed0237a7ee4a" UNIQUE ("title"))`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_course" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "estimatedTime" varchar, "materialsNeeded" text, "creatorId" integer NOT NULL, CONSTRAINT "UQ_ac5edecc1aefa58ed0237a7ee4a" UNIQUE ("title"), CONSTRAINT "FK_cabe77f81b36bb1d647ef9c149d" FOREIGN KEY ("creatorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_course"("id", "version", "title", "description", "estimatedTime", "materialsNeeded", "creatorId") SELECT "id", "version", "title", "description", "estimatedTime", "materialsNeeded", "creatorId" FROM "course"`
    );
    await queryRunner.query(`DROP TABLE "course"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_course" RENAME TO "course"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" RENAME TO "temporary_course"`
    );
    await queryRunner.query(
      `CREATE TABLE "course" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" integer NOT NULL, "title" varchar NOT NULL, "description" text NOT NULL, "estimatedTime" varchar, "materialsNeeded" text, "creatorId" integer NOT NULL, CONSTRAINT "UQ_ac5edecc1aefa58ed0237a7ee4a" UNIQUE ("title"))`
    );
    await queryRunner.query(
      `INSERT INTO "course"("id", "version", "title", "description", "estimatedTime", "materialsNeeded", "creatorId") SELECT "id", "version", "title", "description", "estimatedTime", "materialsNeeded", "creatorId" FROM "temporary_course"`
    );
    await queryRunner.query(`DROP TABLE "temporary_course"`);
    await queryRunner.query(`DROP TABLE "course"`);
  }
}
