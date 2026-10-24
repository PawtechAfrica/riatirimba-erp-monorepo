import { z } from "zod";

const createModuleSchema = z.object({
	body: z.object({
		admissionNumber: z.string(),
		moduleNumber: z.number(),
		year: z.number().nullish(),
	}),
	user: z.object({
		sub: z.string("Please log in to complete this action!").or(z.number("Please log in to complete this action!")),
	}),
});
const autoCreateModuleSchema = z.object({
	body: z.object({
		admissionNumber: z.string().nonempty(),
		moduleNumber: z.number().nullish(),
		year: z.number().nullish(),
	}),
	user: z.object({
		sub: z.string("Please log in to complete this action!").or(z.number("Please log in to complete this action!")),
	}),
});

export default {
	createModuleSchema,
	autoCreateModuleSchema,
};

export type CreateModuleSchemaInput = z.infer<typeof createModuleSchema>;
export type AutoCreateModuleSchemaInput = z.infer<typeof autoCreateModuleSchema>;
