import z from "zod";
import { GenderEnum } from "../types";

/**
 * page: number;
 gender?: GenderEnum | null; // or the specific union type if GenderEnum is an array
 migrated?: boolean | null;
 pending?: boolean | null;
 course: number[];
 department: number[];
 submitted?: boolean | null;
 completed?: boolean | null;
 incomplete?
 */

const stringToBool = z.preprocess((val) => {
    // Only intercept if it's a string
    if (typeof val === "string") {
        const lower = val.toLowerCase();
        // Explicitly map true/false strings to actual booleans
        if (lower === "true") return true;
        if (lower === "false") return false;
    }
    // For anything else ("apple", "", undefined, numbers),
    // pass it through and let z.boolean() catch the error.
    return val;
}, z.boolean());

const shouldBeArray = z.preprocess((arg) => {
    if (Array.isArray(arg)) return arg;
    if (typeof arg === "string" || typeof arg === "number") return [arg];
    return arg;
}, z.array(z.coerce.number()));

const fetchApplicantsSchema = z.object({
    query: z
        .object({
            page: z.coerce.number().optional(),
            gender: z.enum(GenderEnum).optional(),
            intake: z.string().optional(),
            course: shouldBeArray.optional(),
            department: shouldBeArray.optional(),
            pending: stringToBool.optional(),
            migrated: stringToBool.optional(),
            submitted: stringToBool.optional(),
            completed: stringToBool.optional(),
            incomplete: stringToBool.optional(),
        })
        .strict(),
});

export default {
    fetchApplicantsSchema,
};

export type FetchApplicantsSchemaObj = z.infer<typeof fetchApplicantsSchema>;
