"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
(async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    const migrator = orm.getMigrator();
    if (await migrator.checkMigrationNeeded()) {
        await migrator.createInitialMigration();
        await migrator.up();
    }
    await orm.close();
})();
//# sourceMappingURL=migration.js.map