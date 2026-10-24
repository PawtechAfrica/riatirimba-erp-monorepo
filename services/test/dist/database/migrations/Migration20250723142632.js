"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250723142632 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250723142632 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table "applicant" drop column "county", drop column "sub_county", drop column "constituency", drop column "ward";`);
        this.addSql(`alter table "applicant" add column "address" jsonb null;`);
    }
    async down() {
        this.addSql(`alter table "applicant" drop column "address";`);
        this.addSql(`alter table "applicant" add column "county" varchar(255) null, add column "sub_county" varchar(255) null, add column "constituency" varchar(255) null, add column "ward" varchar(255) null;`);
    }
}
exports.Migration20250723142632 = Migration20250723142632;
//# sourceMappingURL=Migration20250723142632.js.map