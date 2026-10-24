import { AppRequest, ReqHandler } from "../@types.global";
import express from "express";

export const tryCatchAsync = (
	// handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>,
	handler: ReqHandler,
) => {
	return (req: AppRequest, res: express.Response, next: express.NextFunction) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};
};
