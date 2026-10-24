import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788468542721 implements MigrationInterface {
    name = 'AutoMigration1788468542721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" RENAME COLUMN "enrolledBy" TO "enroller"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" RENAME COLUMN "enroller" TO "enrolledBy"`);
    }

}
