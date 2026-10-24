import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769720786698 implements MigrationInterface {
    name = 'AutoMigration1769720786698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "intake"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "intake" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "intake"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "intake" integer`);
    }

}
