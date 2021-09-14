/*
  Warnings:

  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3);

UPDATE `Course` SET `updatedAt` = `createdAt` WHERE `updatedAt` IS NULL;

ALTER TABLE `Course` CHANGE `updatedAt` `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3);

UPDATE `User` SET `updatedAt` = `createdAt` WHERE `updatedAt` IS NULL;

ALTER TABLE `User` CHANGE `updatedAt` `updatedAt` DATETIME(3) NOT NULL;
