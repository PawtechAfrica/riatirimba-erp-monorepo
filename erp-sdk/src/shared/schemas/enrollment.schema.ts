import { z } from 'zod';

export const createModuleFormSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  moduleNumber: z.string().min(1, 'Module number is required'),
  termNumber: z.string().min(1, 'Term number is required'),
});

export const createModuleDtoSchema = z.object({
  admissionNumber: z.string(),
  moduleNumber: z.coerce.number(),
  termNumber: z.coerce.number(),
});

export const moduleSchemaAPI = z.object({
  id: z.string(),
  termNumber: z.number(),
  courseId: z.number(),
  moduleNumber: z.number(),
  academicYear: z.number(),
  status: z.string(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  enroller: z.coerce.string(),
});

export const enrollmentFormSchema = z.object({
  admissionNumber: z.string().nullable(),
  course: z.coerce.string().nullable(),
  createdAt: z.coerce.date().default(() => new Date()),
  id: z.coerce.number().default(0),
  intake: z.coerce.string().nullable(),
  newApplicant: z.boolean().nullable(),
  studentType: z.coerce.string().nullable(),
  examiningBody: z.coerce.string().nullable(),
  yearOfStudy: z.coerce.string().default('1'),
  modules: z.array(z.any()).default([]),
});

export type CreateModuleFormInput = z.infer<typeof createModuleFormSchema>;
export type CreateModuleDTO = z.infer<typeof createModuleDtoSchema>;
export type ModuleSchemaAPI = z.infer<typeof moduleSchemaAPI>;
export type EnrollmentFormInput = z.infer<typeof enrollmentFormSchema>;
