import z from "zod";
import {ExamBodyEnum, StudentTypeEnum} from "../types";

const createEnrollmentSchema = z.object({
    course: z.coerce.number().optional(),
    intake: z.string().optional(),
    newApplicant: z.boolean().optional(),
    admissionNumber: z.string().transform(val => val.toUpperCase() ?? "").optional().nullable(),
    studentType: z.enum(StudentTypeEnum).optional().transform(val => val ? val.toUpperCase() : ""),
    yearOfStudy: z.coerce.number().optional(),
    examiningBody: z.enum(ExamBodyEnum).optional(),
});

const updateEnrollmentSchema = createEnrollmentSchema.extend({
    id: z.number(),
});

export default {
    createEnrollmentSchema,
    updateEnrollmentSchema,
};

export type CreateEnrollmentObj = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentObj = z.infer<typeof updateEnrollmentSchema>;
