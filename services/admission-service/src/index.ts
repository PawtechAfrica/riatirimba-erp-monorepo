import express from "express";
import dotenv from "dotenv";
import {RequestContext} from "@mikro-orm/core";
import v1Routes from "./routes/v1/v1";
import globalError from "./services/globalError";
import cors from "cors";
import {db, initDB} from "./database/utils/db-bootstrap.util";
import morganMiddleware from "./utils/logger/morgan";
import {corsOptions} from "./utils/bootstrappers";
import {viewFiles} from "./middleware/viewFiles";
// register listeners
import "./events/listeners";
import {gracefulShutdown} from "./utils/functions";
import {runCrons} from "./crons/cron-runner";
import bootstrapListeners from "./events/listeners";
// Load environment variables from .env file
dotenv.config();

const PORT = process.env.ADMISSION_PORT || 5000;


const bootstrap = async () => {
    // Initialize MikroORM
    await initDB().then(() => {
        console.log("\n💽 DATABASE CONNECTED SUCCESSFULLY");
    });

    const app = express();
    app.set("query parser", "extended");

    // Middleware
    // enable preflight
    if (process.env.NODE_ENV === "development") {
        app.options(/(.*)/, cors(corsOptions));
        app.use(cors(corsOptions));
    }

    app.use(morganMiddleware);
    app.use(express.urlencoded({limit: "50mb", extended: true}));
    app.use(express.json({limit: "50mb"}));
    // app.use("/api/v1/static", express.static(path.join(__dirname, "..", "uploads")));

    // Inject entity manager
    app.use((_req, _res, next) => {
        return RequestContext.create(db.orm.em, next);
    });

    app.get("/", (_req, res) => {
        res.send("Admission Server is running 🚀");
    });

    app.use("/api/v1", v1Routes);
    app.use("/api/v1/view-files/:filename", viewFiles);

    //connect error listener
    app.use(globalError);

    // Start server
    const server = app.listen(Number(PORT), () => {
        console.log(`🚀 SERVER RUNNING ON PORT: ${PORT}`);
        console.log(`🔌 API AVAILABLE AT: http://localhost:${PORT}/api/v1`);
    });
    // Instantiate crons
    await runCrons();
    // instantiate cron listeners
    bootstrapListeners()

    process.on("SIGINT", () => gracefulShutdown(server, db.orm));
    process.on("SIGTERM", () => gracefulShutdown(server, db.orm));
};

// Handle any errors during startup
bootstrap().catch((err) => {
    console.error("Error during application bootstrap:", err);
    process.exit(1);
});
