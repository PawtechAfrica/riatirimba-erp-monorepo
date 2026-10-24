import z from "zod";

export const admissionApplicantSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	phoneNumber: z.string().min(8, "Phone number is required"),
	nationalId: z.string().optional(),
	courseId: z.coerce.number({ message: "Course selection is required" }),
	intakeId: z.number().optional(),
});

export type AdmissionApplicantInput = z.infer<typeof admissionApplicantSchema>;
