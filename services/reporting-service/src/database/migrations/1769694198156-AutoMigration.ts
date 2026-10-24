import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769694198156 implements MigrationInterface {
    name = 'AutoMigration1769694198156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" RENAME COLUMN "intakeId" TO "intake"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" RENAME COLUMN "intake" TO "intakeId"`);
    }

}
