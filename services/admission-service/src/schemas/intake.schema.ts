import z from "zod";
import { IntakePeriodEnum } from "../types";

const createIntakeSchema = z.object({
    period: z.nativeEnum(IntakePeriodEnum, ),
    year: z.number(),
    opens: z.coerce.date().optional(),
    closes: z.coerce.date().optional(),
});

const updateIntakeSchema = createIntakeSchema.extend({
    closed: z.boolean().optional(),
});

export default {
    createIntakeSchema,
    updateIntakeSchema,
};

export type CreateIntakeObj = z.infer<typeof createIntakeSchema>;
export type UpdateIntakeObj = z.infer<typeof updateIntakeSchema>;
