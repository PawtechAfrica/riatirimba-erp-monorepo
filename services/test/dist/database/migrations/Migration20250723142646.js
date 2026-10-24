"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250723142646 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250723142646 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table "applicant" alter column "address" type jsonb using ("address"::jsonb);`);
        this.addSql(`alter table "applicant" alter column "address" set not null;`);
    }
    async down() {
        this.addSql(`alter table "applicant" alter column "address" type jsonb using ("address"::jsonb);`);
        this.addSql(`alter table "applicant" alter column "address" drop not null;`);
    }
}
exports.Migration20250723142646 = Migration20250723142646;
//# sourceMappingURL=Migration20250723142646.js.map