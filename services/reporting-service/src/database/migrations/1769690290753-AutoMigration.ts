import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1769690290753 implements MigrationInterface {
    name = 'AutoMigration1769690290753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" RENAME COLUMN "idType" TO "birthCertNumber"`);
        await queryRunner.query(`ALTER TYPE "public"."applicant_records_idtype_enum" RENAME TO "applicant_records_birthcertnumber_enum"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "birthCertNumber"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "birthCertNumber" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant_records" DROP COLUMN "birthCertNumber"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" ADD "birthCertNumber" "public"."applicant_records_birthcertnumber_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."applicant_records_birthcertnumber_enum" RENAME TO "applicant_records_idtype_enum"`);
        await queryRunner.query(`ALTER TABLE "applicant_records" RENAME COLUMN "birthCertNumber" TO "idType"`);
    }

}
