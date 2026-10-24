import z from "zod";

const createAddressSchema = z.object({
    poBox: z.number(),
    zipCode: z.number(),
    county: z.string().min(1, "County cannot be empty"),
    location: z.string().min(1, "Location cannot be empty"),
    subLocation: z.string().min(1, "Sub-location cannot be empty"),
    village: z.string().min(1, "Village cannot be empty"),
});

const updateAddressSchema = z.object({
    id: z.number().optional(),
    poBox: z.number().nullable().optional(),
    zipCode: z.number().nullable().optional(),
    county: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    subLocation: z.string().nullable().optional(),
    village: z.string().nullable().optional(),
});

export default {
    createAddressSchema,
    updateAddressSchema,
};

export type CreateAddressObj = z.infer<typeof createAddressSchema>;
export type UpdateAddressObj = z.infer<typeof updateAddressSchema>;
