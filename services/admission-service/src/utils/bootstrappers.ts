import {appController} from "../types";
import express, {NextFunction} from "express";
import multer from "multer";
import path from "path";
import {CorsOptions} from "cors";
import dotenv from "dotenv";

dotenv.config();

export const tryCatch = (handler: appController): appController => {
    return (req: express.Request, res: express.Response, next: NextFunction): Promise<void> | void => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export class AppError extends Error {

    constructor(message: string, public status: number = 400, public validations?: {
        property: string,
        message: string
    }[]) {
        super();
        this.message = message;
        this.status = status;
        this.validations = validations;
        this.log()
    }

    log() {
        console.error(`Error occurred while executing request: \t message: ${this.message}\n\t`, this)
    }
}


export const multerParse = () =>
    multer({
        dest: path.join(__dirname, "../uploads"),
        limits: {
            fileSize: 1024 * 1024 * 5, // 5mb in bytes
        },
    });


const allowedOrigins = ["http://localhost:3001", "http://localhost:3000", "http://localhost:4173", "http://localhost:5173"];

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
    allowedHeaders: ["Content-Type", "Authorization"],
};
