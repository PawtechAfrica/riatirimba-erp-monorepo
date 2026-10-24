import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769694337725 implements MigrationInterface {
    name = 'AutoMigration1769694337725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "dateOfBirth" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "dateOfBirth"`);
    }

}
