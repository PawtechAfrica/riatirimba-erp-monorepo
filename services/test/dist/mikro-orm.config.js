"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const postgresql_1 = require("@mikro-orm/postgresql");
const reflection_1 = require("@mikro-orm/reflection");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const migrations_1 = require("@mikro-orm/migrations");
dotenv_1.default.config();
// generate metadata.json
// generate js files
// copy /temp/metadata.json -> dist/temp
const config = {
  driver: postgresql_1.PostgreSqlDriver,
  metadataProvider:
    process.env.NODE_ENV === "development"
      ? reflection_1.TsMorphMetadataProvider
      : undefined,
  dbName: process.env.ADMISSION_DB_NAME,
  user: process.env.ADMISSION_DB_USER,
  password: process.env.ADMISSION_DB_PASSWORD,
  host: process.env.ADMISSION_DB_HOST || "localhost",
  port: parseInt(process.env.ADMISSION_DB_PORT || "5432"),
  debug: process.env.NODE_ENV !== "production",
  entities: [path_1.default.join(__dirname, "/database/entities/*.entity.js")],
  entitiesTs: ["./src/database/entities/*.entity.ts"],
  extensions: [migrations_1.Migrator],
  tsNode: process.env.NODE_ENV !== "production",
  preferTs: process.env.NODE_ENV !== "production",
  migrations: {
    path: path_1.default.join(__dirname, "./database/migrations"),
    pathTs: "./src/database/migrations",
    glob: "!(*.d).{js,ts}",
  },
  ...(process.env.NODE_ENV === "production"
    ? {
        metadataCache: {
          enabled: true,
          adapter: core_1.GeneratedCacheAdapter,
          options: { data: require("./temp/metadata.json") },
        },
      }
    : {}),
};
exports.default = config;
//# sourceMappingURL=mikro-orm.config.js.map
