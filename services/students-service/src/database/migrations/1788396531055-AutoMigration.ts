import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788396531055 implements MigrationInterface {
    name = 'AutoMigration1788396531055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."course_module_status_enum" AS ENUM('COMPLETED', 'IN_PROGRESS')`);
        await queryRunner.query(`CREATE TABLE "course_module" ("id" uuid NOT NULL, "termNumber" integer NOT NULL, "moduleNumber" integer NOT NULL, "year" integer DEFAULT '2026', "status" "public"."course_module_status_enum" DEFAULT 'IN_PROGRESS', "completedAt" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "enrollmentId" bigint NOT NULL, CONSTRAINT "PK_9d04c56010223c5997cc71093b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "course_module" ADD CONSTRAINT "FK_b02cb0bbbe31d66d3116e07210f" FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_module" DROP CONSTRAINT "FK_b02cb0bbbe31d66d3116e07210f"`);
        await queryRunner.query(`DROP TABLE "course_module"`);
        await queryRunner.query(`DROP TYPE "public"."course_module_status_enum"`);
    }

}
