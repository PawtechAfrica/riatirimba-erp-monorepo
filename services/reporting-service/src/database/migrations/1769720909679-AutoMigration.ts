import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769720909679 implements MigrationInterface {
    name = 'AutoMigration1769720909679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "firstName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "lastName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "newApplicant" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "firstName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "lastName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "newApplicant" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "newApplicant" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "lastName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "firstName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "newApplicant" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "lastName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ALTER COLUMN "firstName" SET NOT NULL`);
    }

}
