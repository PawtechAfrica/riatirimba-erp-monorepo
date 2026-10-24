import { Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import path from "path";
import dotenv from "dotenv";
import { Migrator } from "@mikro-orm/migrations";
import { ApplicantSubscriber } from "./database/subscribers/Applicant.subscriber";
import { IntakeSubscriber } from "./database/subscribers/Intake.subscriber";
import { EnrollmentSubscriber } from "./database/subscribers/Enrollment.subscriber";
import { SeedManager } from "@mikro-orm/seeder";

dotenv.config();

const isDevEnvironment = process.env.NODE_ENV === "development";

const config: Options<PostgreSqlDriver> = {
    driver: PostgreSqlDriver,
    metadataProvider: isDevEnvironment ? TsMorphMetadataProvider : ReflectMetadataProvider,
    dbName: process.env.ADMISSION_DB_NAME,
    user: process.env.ADMISSION_DB_USER,
    password: process.env.ADMISSION_DB_PASSWORD,
    host: process.env.ADMISSION_DB_HOST || "localhost",
    port: parseInt(process.env.ADMISSION_DB_PORT || "5432"),
    debug: false, //process.env.NODE_ENV === 'development',
    entities: [path.join(__dirname, "./database/entities/**.entity.js")],
    entitiesTs: [path.join(__dirname, "./database/entities/**.entity.ts")],
    subscribers: [ApplicantSubscriber, IntakeSubscriber, EnrollmentSubscriber],
    extensions: [Migrator, SeedManager],
    preferTs: isDevEnvironment,
    seeder: {
        emit: "ts",
        pathTs: "./src/database/seeders/",
        path: "./dist/src/database/seeders/",
    },
    migrations: {
        path: "./database/migrations/",
        pathTs: "./src/database/migrations/",
    },
};

export default config;
