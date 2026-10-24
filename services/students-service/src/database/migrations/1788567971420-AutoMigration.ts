import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788567971420 implements MigrationInterface {
    name = 'AutoMigration1788567971420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" RENAME COLUMN "year" TO "academicYear"`);
        await queryRunner.query(`ALTER TABLE "course_module" ALTER COLUMN "academicYear" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_module" ALTER COLUMN "academicYear" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" ALTER COLUMN "academicYear" SET DEFAULT '2026'`);
        await queryRunner.query(`ALTER TABLE "course_module" ALTER COLUMN "academicYear" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_module" RENAME COLUMN "academicYear" TO "year"`);
    }

}
