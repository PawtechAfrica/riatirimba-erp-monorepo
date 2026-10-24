import express from "express";
import {AppError} from "../utils/AppErrorClasses";
import {ValidationError} from "class-validator";


export function globalErrorHandler(
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) {
    console.log("\n Error: \n", err)
    
    try {

        if (err instanceof AppError)
            return res.status(err.status).json({
                error: err.message,
                ...(err.validations ? ({validations: err.validations}) : {})
            }).end();

        if (err instanceof ValidationError)
            return res.status(400).json({err: "Please check your inputs are correct and try again!"}).end()
        return res.status(500).json({
            error: "Sorry, something went wrong! Please try again later!",
        }).end();
    } catch (err) {
        return res.status(500).json({
            error: "Sorry, something went completely wrong! Please try again later!",
        }).end();
    }
}

