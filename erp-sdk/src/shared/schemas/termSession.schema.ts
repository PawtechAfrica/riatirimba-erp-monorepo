import { SessionPeriod } from "#shared/enums/termSession.enum.js";
import { nameFormatter } from "#shared/formatters/index.js";
import { z } from "zod";

export const termSessionPayload = z.object({
	id: z.number().optional(),
	name: z
		.string()
		.min(1, "Session name is required")
		.transform((arg) => nameFormatter.nameCasingFormatter(arg)),
	academicYear: z.coerce.number().default(1),
	startDate: z.string().or(z.date()),
	endDate: z.string().or(z.date()),
	status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"]).default("UPCOMING"),
});

export const createTermSessionSchema = z.object({
	period: z.nativeEnum(SessionPeriod),
	startDate: z.coerce.date(),
	endDate: z.coerce.date().nullable(),
});

export type TermSessionPayload = z.infer<typeof termSessionPayload>;
export type CreateTermSessionPayload = z.infer<typeof createTermSessionSchema>;
