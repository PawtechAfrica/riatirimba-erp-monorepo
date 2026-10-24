import express, {NextFunction} from "express";
import {AppError} from "../utils/bootstrappers";
import {ValidationError} from "@mikro-orm/core";


export default async function globalError(
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: NextFunction
) {
    // 🔹 Added Winston logging (with stack trace if present)
    // logger.error(`${err}\n`);
    console.log(err)

    try {
        if (err instanceof AppError)
            return res.status(err.status).json({
                error: err.message,
                ...(err.validations ? ({validations: err.validations}) : {})
            }).end();
        if (err instanceof ValidationError)
            return res.status(400).json({error: "Please check your inputs are correct and try again!"}).end()

        console.log("\n Uncaught: \n", err)
        return res.status(500).json({
            error: "Sorry, something went wrong! Please try again later!",
        }).end();
    } catch (err) {
        return res.status(500).json({
            error: "Sorry, something went completely wrong! Please try again later!",
        }).end();
    }
}

