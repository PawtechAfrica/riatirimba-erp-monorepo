import {CorsOptions} from "cors";

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:4173"];

export const corsOptions: CorsOptions = {
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin.trim())) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}