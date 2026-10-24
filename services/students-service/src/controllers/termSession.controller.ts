import { Request, Response } from "express";
import { tryCatchAsync } from "../utils/tryCatchAsync";
import { CloseTermSessionInput, CreateTermSessionInput } from "../schema/termSession.schema";
import { BaseController } from "./Base.controller";
import { TermSessionService } from "../services/TermSession.service";
import respond from "../utils/respond";

export class TermSessionController extends BaseController<TermSessionService> {
	getSessions = tryCatchAsync(async (_req: Request, res: Response) => {
		const sessions = await this.service.getSessions();
		respond(res, "Term sessions retrieved successfully", sessions);
	});

	createTermSession = tryCatchAsync(async (req: Request, res: Response) => {
		const data = req.body as CreateTermSessionInput["body"];
		const result = await this.service.createSession(data);
		respond(res, "Term session created successfully", result);
	});

	closeTermSession = tryCatchAsync(async (req: Request, res: Response) => {
		const { id } = req.params as unknown as CloseTermSessionInput["params"];
		const result = await this.service.closeSession(id);
		respond(res, "Term session closed successfully", result);
	});
}
