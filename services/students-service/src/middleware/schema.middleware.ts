import { Request, Response, NextFunction } from "express";
import * as zod from "zod";
import { AppError } from "../utils/AppErrorClasses";
import { AppRequest } from "../@types.global";

/**
 * Middleware to validate request data against a Zod schema.
 * It validates request body, query parameters, and route parameters.
 * * @param schema The Zod schema to validate against.
 */
const validateSchema = (schema: zod.ZodSchema) => {
	return async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = (await schema.parseAsync({
				body: req.body,
				query: { ...req.query },
				params: { ...req.params },
				user: { ...(req?.user || {}) },
			})) as { body?: any; query?: any; params?: any };

			// Update the request objects with parsed/validated data
			if (parsed.body !== undefined) req.body = parsed.body;

			// Fix: Override the getter for req.query
			if (parsed.query !== undefined) {
				Object.defineProperty(req, "query", {
					value: parsed.query,
					writable: true,
					configurable: true,
					enumerable: true,
				});
			}

			if (parsed.params !== undefined) req.params = parsed.params;

			next();
		} catch (error) {
			if (error instanceof zod.ZodError) {
				const validations = error.issues.map((issue) => ({
					property: issue.path.map((p) => String(p)).join("."),
					message: issue.message,
				}));
				return next(new AppError("Validation failed", 400, validations));
			}
			next(error);
		}
	};
};

export default validateSchema;
