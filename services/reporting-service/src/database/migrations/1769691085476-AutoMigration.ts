import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769691085476 implements MigrationInterface {
    name = 'AutoMigration1769691085476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "pending" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "pending"`);
    }

}
