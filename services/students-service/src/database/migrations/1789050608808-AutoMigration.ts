import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1789050608808 implements MigrationInterface {
    name = 'AutoMigration1789050608808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollment" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD "department" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollment" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD "department" integer`);
    }

}
