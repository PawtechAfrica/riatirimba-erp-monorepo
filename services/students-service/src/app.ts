import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "node:http";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { corsOptions } from "./utils/CorsOptions";
import { helmetOptions } from "./utils/HelmetOptions";

export class App {
    public app: express.Application;

    constructor(private routers: [string, express.Router][]) {
        this.app = express();
        // attach middleware
        this.attachMiddleware();
        // attach routers and global error handler
        this.attachRouters();
     
    }

    private attachMiddleware() {
        if (process.env.NODE_ENV === "development") {
            this.app.use(cors(corsOptions));
        }
        this.app.use(helmet(helmetOptions));
        this.app.use(express.json({ limit: "50mb" }));
        this.app.use(express.urlencoded({ limit: "50mb" }));
    }

    private attachRouters() {
        this.app.get("/", (req, res) => {
            res.send("✅ Student service is up and running!");
        });

        this.routers.forEach(([prefix, router]) => {
            this.app.use(prefix, router);
        });
        this.app.use(globalErrorHandler);
    }

    shutdown(server: Server) {
        console.log("Shutting down server...");
    }

    listen(port: number) {
        return this.app.listen(port, (error) => {
            if (error) return console.log("Error occurred while starting server!", error);
            console.log(`🔌 STUDENT SERVICE RUNNING ON PORT ${port}\n`);
        });
    }
}
