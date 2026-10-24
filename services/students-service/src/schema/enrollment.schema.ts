import z from "zod";
import { EnrollmentStatusEnum, ExamBody, StudentTypeEnum } from "../database/@types.database";
import sharedSchema from "./shared.schema";

const createEnrollmentSchema = z.object({
	course: z.coerce.number("A course is required to enroll a student!"),
	yearOfStudy: z.coerce.number().nullish().default(1),
	newApplicant: sharedSchema.stringBooleanSchema.or(z.boolean()),
	examiningBody: z.enum(ExamBody).default(ExamBody.CDACC),
	intake: z.string("Please select an intake!"),
	admissionNumber: z.string("Please provide an admission number!").nullish(),
	sponsor: z.enum(StudentTypeEnum).default(StudentTypeEnum.KUCCPS__GOVT_SPONSORED),
	status: z.enum(EnrollmentStatusEnum).default(EnrollmentStatusEnum.ACTIVE),
});

const updateEnrollmentSchema = createEnrollmentSchema.partial();

const createEnrollmentRequestSchema = z.object({
	params: z.object({
		auto: z
			.enum(["true", "false"], "Invalid argument in the request!")
			.transform((arg) => arg === "true")
			.pipe(z.boolean()),
		traineeId: z.uuid("Invalid trainee details"),
	}),
	body: createEnrollmentSchema,
});

const updateEnrollmentRequestSchema = z.object({
	params: z.object({
		auto: z
			.enum(["true", "false"], "Invalid argument in the request!")
			.transform((arg) => arg === "true")
			.pipe(z.boolean()),
		traineeId: z.uuid("Invalid trainee details"),
		enrollmentId: z.coerce.bigint("Invalid enrollment"),
	}),
	body: updateEnrollmentSchema,
});

export default {
	createEnrollmentSchema,
	updateEnrollmentSchema,
	createEnrollmentRequestSchema,
	updateEnrollmentRequestSchema,
};

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type CreateEnrollmentRequest = z.infer<typeof createEnrollmentRequestSchema>;
export type UpdateEnrollmentRequest = z.infer<typeof updateEnrollmentRequestSchema>;
