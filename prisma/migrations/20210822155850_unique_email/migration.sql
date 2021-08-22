/*
  Warnings:

  - A unique constraint covering the columns `[emailAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User.emailAddress_unique` ON `User`(`emailAddress`);
