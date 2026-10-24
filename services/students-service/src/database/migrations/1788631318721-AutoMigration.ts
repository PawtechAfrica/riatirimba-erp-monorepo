import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788631318721 implements MigrationInterface {
    name = 'AutoMigration1788631318721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."term_session_period_enum" AS ENUM('jan-apr', 'may-aug', 'sep-dec')`);
        await queryRunner.query(`CREATE TABLE "term_session" ("id" bigint NOT NULL, "period" "public"."term_session_period_enum" NOT NULL, "startDate" date NOT NULL, "endDate" date, "year" smallint NOT NULL, CONSTRAINT "PK_29400d85bd7c9c00d4ee41eb362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "sessionId" bigint`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3c522e99a49cfadb6f432a12e"`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "moduleNumber"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "moduleNumber" smallint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "academicYear"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "academicYear" smallint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP COLUMN "yearOfStudy"`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD "yearOfStudy" smallint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`CREATE INDEX "IDX_e3c522e99a49cfadb6f432a12e" ON "course_module" ("enrollmentId", "moduleNumber") `);
        await queryRunner.query(`ALTER TABLE "course_module" ADD CONSTRAINT "FK_cc620cae1138d4bfdbf4ce80d01" FOREIGN KEY ("sessionId") REFERENCES "term_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" DROP CONSTRAINT "FK_cc620cae1138d4bfdbf4ce80d01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3c522e99a49cfadb6f432a12e"`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP COLUMN "yearOfStudy"`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD "yearOfStudy" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "academicYear"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "academicYear" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "moduleNumber"`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD "moduleNumber" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e3c522e99a49cfadb6f432a12e" ON "course_module" ("enrollmentId", "moduleNumber") `);
        await queryRunner.query(`ALTER TABLE "course_module" DROP COLUMN "sessionId"`);
        await queryRunner.query(`DROP TABLE "term_session"`);
        await queryRunner.query(`DROP TYPE "public"."term_session_period_enum"`);
    }

}
