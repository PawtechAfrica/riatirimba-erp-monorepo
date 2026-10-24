import {createLogger, format, transports} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const LOG_DIR = path.join(__dirname, "../../..", "logs");


const logFormat = format.combine(
    format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
    format.errors({stack: true}), // ensures stack traces are logged
    format.printf(({timestamp, level, message, stack, ...meta}) => {
        return stack
            ? `\n${timestamp} ${level.toUpperCase()}: ${message}\n${stack}\n`
            : `\n${timestamp} ${level.toUpperCase()}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ""
            }\n`;
    })
);

const logger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        // Console output (colorized for dev)
        new transports.Console({
            format: format.combine(format.colorize({colors: {format: "green"}}), logFormat),
        }),

        // Rotating access logs
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "access-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: "info",
        }),

        // Rotating error logs
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            level: "error",
        }),
    ],
});

export default logger;
