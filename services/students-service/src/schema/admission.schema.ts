import z from "zod";

const downloadAdmissionLetterSchema = z.object({
    params: z
        .object({
            applicant_id: z.string(),
            intake_period: z.string(),
        })
        .strict(),
});

export default {
    downloadAdmissionLetterSchema,
};

export type DownloadAdmissionLetterSchemaObj = z.infer<typeof downloadAdmissionLetterSchema>;
