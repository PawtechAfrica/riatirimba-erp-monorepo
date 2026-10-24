import z from 'zod';
import {ModuleStatusEnum} from "@/libs/types/trainee.types.ts";


const createModuleFormSchema = z.object({
    admissionNumber: z.string(),
    moduleNumber: z.string(),
    termNumber: z.string(),
    // year: z.coerce.date().nullish(),
})
const createModuleDtoSchema = z.object({
    admissionNumber: z.string(),
    moduleNumber: z.coerce.number(),
    termNumber: z.coerce.number(),
    // year: z.coerce.date().transform(arg => arg.getFullYear()).nullish(),
})

// Server response object
const moduleSchemaAPI = z.object({
    id: z.string(),
    termNumber: z.number(),
    courseId: z.number(),
    moduleNumber: z.number(),
    academicYear: z.number(),
    status: z.enum(ModuleStatusEnum),
    completedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    enroller: z.coerce.string(),
})

const enrollmentFormSchema = z.object({
    admissionNumber: z.string().nullable(),
    course: z.coerce.string().nullable(),
    createdAt: z.coerce.date().default(new Date()),
    id: z.coerce.number().default(0),
    intake: z.coerce.string().nullable(),
    newApplicant: z.transform(arg => {
        if (arg === true) return 'true'
        if (arg === false) return 'false'
        return null
    }),
    studentType: z.coerce.string().nullable(),
    examiningBody: z.coerce.string().nullable(),
    yearOfStudy: z.coerce.string().default("1"),
    modules: z.array(z.any())
})

// Schema for object to send to server when updating enrollment
const updateEnrollmentDTOSchema = enrollmentFormSchema
    .omit({modules: true})
    .extend({
        newApplicant: z.transform(arg => arg ? arg === 'true' : null),
    })

export default {
    enrollmentFormSchema,
    createModuleFormSchema,
    createModuleDtoSchema,
    moduleSchemaAPI,
    updateEnrollmentDTOSchema,

}

export type EnrollmentFormInput = z.infer<typeof enrollmentFormSchema>
export type CreateModuleInput = z.infer<typeof createModuleFormSchema>
export type EnrollmentAPI = z.infer<typeof enrollmentFormSchema>
export type UpdateEnrollmentDTO = z.infer<typeof updateEnrollmentDTOSchema>
export type CreateModuleDTO = z.infer<typeof createModuleDtoSchema>
export type ModuleSchemaAPI = z.infer<typeof moduleSchemaAPI>
