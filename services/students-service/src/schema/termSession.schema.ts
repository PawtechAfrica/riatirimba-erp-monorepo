import z from "zod";
import { SessionPeriod } from "../database/entities/TermSession.entity";

const createTermSessionSchema = z.object({
	body: z.object({
		period: z.enum(SessionPeriod),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().nullable(),
	}),
});

const closeTermSessionSchema = z.object({
	params: z.object({
		id: z.string("Session ID is required"),
	}),
});

export default {
	createTermSessionSchema,
	closeTermSessionSchema,
};

export type CreateTermSessionInput = z.infer<typeof createTermSessionSchema>;
export type CloseTermSessionInput = z.infer<typeof closeTermSessionSchema>;
