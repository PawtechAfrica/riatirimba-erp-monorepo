import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788468421633 implements MigrationInterface {
    name = 'AutoMigration1788468421633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "enrolledBy"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "enrolledBy" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "enrolledBy"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "enrolledBy" uuid NOT NULL`);
    }

}
