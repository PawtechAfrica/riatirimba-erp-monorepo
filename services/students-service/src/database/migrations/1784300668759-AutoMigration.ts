import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1784300668759 implements MigrationInterface {
    name = 'AutoMigration1784300668759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollment" ADD "department" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_4f9a4f2910c822340a9880631b" ON "enrollment" ("intake") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4f9a4f2910c822340a9880631b"`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP COLUMN "department"`);
    }

}
