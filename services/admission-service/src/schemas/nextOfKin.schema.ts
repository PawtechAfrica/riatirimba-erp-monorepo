import z from "zod";

const createNextOfKinSchema = z.object({
    firstName: z.string().max(100, "First name cannot exceed 100 characters"),
    lastName: z.string().max(100, "Last name cannot exceed 100 characters"),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().max(20, "Phone number cannot exceed 20 characters"),
    relationship: z.string().max(50, "Relationship cannot exceed 50 characters"),
    applicant: z.string().optional(),
});

const updateNextOfKinSchema = z.object({
    id: z.coerce.number().optional(),
    firstName: z.string().max(100, "First name cannot exceed 100 characters").optional(),
    lastName: z.string().max(100, "Last name cannot exceed 100 characters").optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().max(20, "Phone number cannot exceed 20 characters").optional(),
    relationship: z.string().max(50, "Relationship cannot exceed 50 characters").optional(),
    applicant: z.string().optional(),
});

export default {
    createNextOfKinSchema,
    updateNextOfKinSchema,
};

export type CreateNextOfKinObj = z.infer<typeof createNextOfKinSchema>;
export type UpdateNextOfKinObj = z.infer<typeof updateNextOfKinSchema>;
