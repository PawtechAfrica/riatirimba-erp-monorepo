import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788466760012 implements MigrationInterface {
    name = 'AutoMigration1788466760012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" ADD "courseId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "enrolledBy" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e3c522e99a49cfadb6f432a12e" ON "course_module" ("enrollmentId", "moduleNumber") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e3c522e99a49cfadb6f432a12e"`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "enrolledBy"`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "courseId"`);
    }

}
