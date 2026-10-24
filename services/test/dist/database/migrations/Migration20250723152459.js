"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250723152459 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250723152459 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table "applicant" alter column "kcse_index_number" type varchar(255) using ("kcse_index_number"::varchar(255));`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" set not null;`);
    }
    async down() {
        this.addSql(`alter table "applicant" alter column "kcse_index_number" type varchar(255) using ("kcse_index_number"::varchar(255));`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" drop not null;`);
    }
}
exports.Migration20250723152459 = Migration20250723152459;
//# sourceMappingURL=Migration20250723152459.js.map