import z from "zod";

const createUpdateApplicantDocSchema = z.object({
    passportPhoto: z.string().nullable().optional(),
    identification: z.string().nullable().optional(),
    birthCertificate: z.string().nullable().optional(),
    kcpeCertificate: z.string().nullable().optional(),
    kcseCertificate: z.string().nullable().optional(),
    tertiaryCertificate: z.string().nullable().optional(),
});

export default {
    createUpdateApplicantDocSchema,
};

export type CreateUpdateApplicantDocObj = z.infer<typeof createUpdateApplicantDocSchema>;
