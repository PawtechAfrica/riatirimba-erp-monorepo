import z from "zod";
import { GenderEnum } from "../database/@types.database";
import e from "express";

const filterStudentSchema = z.object({
	query: z
		.object({
			page: z.preprocess((val) => {
				if (val === undefined || val === null || val === "") return 1;
				const num = Number(val);
				return isNaN(num) ? 1 : num;
			}, z.number().int().default(1)),
			count: z.preprocess((val) => {
				if (val === undefined || val === null || val === "") return 100;
				const num = Number(val);
				return isNaN(num) ? 100 : num;
			}, z.number().int().default(100)),
			term: z.string().optional(),
			department: z.preprocess((val) => {
				if (val === undefined || val === null || val === "") return undefined;
				const num = Number(val);
				return isNaN(num) ? undefined : num;
			}, z.number().int().optional()),
			course: z.preprocess((val) => {
				if (val === undefined || val === null || val === "") return undefined;
				const num = Number(val);
				return isNaN(num) ? undefined : num;
			}, z.number().int().optional()),
			intake: z.preprocess((val) => {
				if (val === undefined || val === null || val === "" || val === "null" || val === "undefined")
					return "all";
				return String(val);
			}, z.string().default("all")),
			gender: z.preprocess((val) => {
				if (val === undefined || val === null || val === "") return undefined;
				return String(val);
			}, z.enum(GenderEnum).optional()),
		})
		.strict(),
});

const fetchPaginatedStudentsSchema = z.object({
	query: z.object({
		intake: z.preprocess((val) => {
			if (val === undefined || val === null || val === "") return "all";
			return String(val);
		}, z.string().default("all")),
		page: z.coerce.number().optional().default(1),
		count: z.coerce.number().optional().default(100),
	}),
});

const downloadAdmissionLetterSchema = z.object({
	params: z.object({
		birthCert: z.string(),
		intake: z.string(),
	}),
});
const updateTraineeSchema = z.object({
	params: z.object({
		id: z.uuid(),
	}),
});

export default {
	filterStudentSchema,
	fetchPaginatedStudentsSchema,
	downloadAdmissionLetterSchema,
	updateTraineeSchema,
};

export type FilterStudentSchemaType = z.infer<typeof filterStudentSchema>["query"];
export type FetchPaginatedStudentsInput = z.infer<typeof fetchPaginatedStudentsSchema>;
export type DownloadAdmissionLetterInput = z.infer<typeof downloadAdmissionLetterSchema>;
export type UpdateTraineeInput = z.infer<typeof updateTraineeSchema>;
