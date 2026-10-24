"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250724020736 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250724020736 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table "applicant" drop column "address";`);
        this.addSql(`alter table "applicant" add column "county" varchar(255) null, add column "sub_county" varchar(255) null, add column "constituency" varchar(255) null, add column "ward" varchar(255) null;`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" type varchar(255) using ("kcse_index_number"::varchar(255));`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" drop not null;`);
    }
    async down() {
        this.addSql(`alter table "applicant" drop column "county", drop column "sub_county", drop column "constituency", drop column "ward";`);
        this.addSql(`alter table "applicant" add column "address" jsonb not null;`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" type varchar(255) using ("kcse_index_number"::varchar(255));`);
        this.addSql(`alter table "applicant" alter column "kcse_index_number" set not null;`);
    }
}
exports.Migration20250724020736 = Migration20250724020736;
//# sourceMappingURL=Migration20250724020736.js.map