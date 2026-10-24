import dotenv from "dotenv";
import {DataSource} from "typeorm";

// const __dirname = dirname(__filename);
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.STUDENTS_DB_HOST,
    port: Number(process.env.STUDENTS_DB_PORT) || 5432,
    username: process.env.STUDENTS_DB_USERNAME,
    password: process.env.STUDENTS_DB_PASSWORD,
    database: process.env.STUDENTS_DB_NAME,
    // KISS A HOT KNIFE BEFORE EVEN THINKING ABOUT SETTING THIS TO TRUE IN PRODUCTION
    synchronize: false, //process.env.NODE_ENV === "development",
    logging: false,
    entities: [
        __dirname + "/entities/**/*.entity.{ts,js}",
        // path.join(__dirname + "entities", "**", "*.entity.{ts,js}"),
        // path.join(__dirname + "entities", "*.entity.{ts,js}"),
    ],
    subscribers: [
        // path.join(__dirname, "subscribers", "*.subscriber.{ts,js}")],
        __dirname + "/subscribers/*.subscriber.{ts,js}",
    ],
    migrationsTableName: "students_orm_migrations",
    migrations: [
        // path.join(__dirname, "migrations", "**.{ts,js}"),
        __dirname + "/migrations/**.{ts,js}",
    ],
});
