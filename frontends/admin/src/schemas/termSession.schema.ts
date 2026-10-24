import z from "zod";
import dayjs from "dayjs";
import enrollmentSchema from "@/schemas/enrollment.schema.ts";

export enum SessionPeriod {
    JAN_APR = "jan-apr",
    MAY_AUG = "may-aug",
    SEP_DEC = "sep-dec",
}

// Data returned from the API
const termSessionAPISchema = z.object({
    id: z.string(),
    period: z.enum(SessionPeriod),
    startDate: z.string(),
    endDate: z.coerce.date().nullable(),
    year: z.number(),
    modules: z.array(z.string())
})

// Data parsed for the application
const termSessionDTOSchema = z.object({
    id: z.string(),
    period: z.enum(SessionPeriod).transform(arg => arg.toUpperCase()),
    startDate: z.string().transform(arg => {
        const date = dayjs(arg);
        if (!date.isValid()) return "Invalid date format";
        return date.format("DD MMM YYYY");
    }),
    endDate: z.coerce.date().nullable().transform(arg => {
        if (!arg) return "Unset";
        const date = dayjs(arg);
        if (!date.isValid()) return "Invalid format";
        return date.format("DD MMM YYYY");
    }),
    year: z.number(),
    modules: z.array(enrollmentSchema.moduleSchemaAPI).optional()
});

// For the session creation form
const createTermSessionFormSchema = z.object({
    period: z.enum(SessionPeriod).nullable(),
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
});

// Data to send to the API during creation
const createTermSessionAPISchema = z.object({
    period: z.enum(SessionPeriod, "Please select a session period"),
    startDate: z.coerce.date("Please select a starting date"),
    endDate: z.coerce.date().nullable(),
})

export default {
    createTermSessionFormSchema,
    createTermSessionAPISchema,
    termSessionDTOSchema,
    termSessionAPISchema
}

export type CreateTermSessionFormInput = z.infer<typeof createTermSessionFormSchema>;
export type CreateTermSessionAPIInput = z.infer<typeof createTermSessionAPISchema>;
export type TermSessionDTO = z.infer<typeof termSessionDTOSchema>;
export type TermSessionAPI = z.infer<typeof termSessionAPISchema>;


