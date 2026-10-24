import z from "zod";
import { BasicEducationEnum, GradeEnum, TertiaryLevel } from "../types";

const createAcademicHistorySchema = z.object({
    highestEducationLevel: z.nativeEnum(BasicEducationEnum, {
        message: "Highest education level is required and must be valid",
    }),
    kcpeIndexNumber: z.string()
        .regex(/^(?:\d{11}|\d{9})\/\d{4}$/, "KCPE index number must be in format index/year E.g. 12345678901/2020"),
    primarySchool: z.string().optional(),
    kcseIndexNumber: z.string()
        .regex(/^\d{11}\/\d{4}$/, "KCSE index number must be in format index/year E.g. 12345678901/2020")
        .optional(),
    highSchool: z.string().optional(),
    tertiarySchool: z.string().optional(),
    tertiaryLevel: z.nativeEnum(TertiaryLevel).nullable().optional(),
    kcseGrade: z.nativeEnum(GradeEnum).optional(),
});

const updateAcademicHistorySchema = z.object({
    id: z.number(),
    highestEducationLevel: z.nativeEnum(BasicEducationEnum).nullable().optional(),
    kcseIndexNumber: z.string().optional(),
    kcpeIndexNumber: z.string().optional(),
    primarySchool: z.string().optional(),
    highSchool: z.string().optional(),
    tertiarySchool: z.string().optional(),
    tertiaryLevel: z.nativeEnum(TertiaryLevel).nullable().optional(),
    kcseGrade: z.nativeEnum(GradeEnum).optional(),
});

export default {
    createAcademicHistorySchema,
    updateAcademicHistorySchema,
};

export type CreateAcademicHistoryObj = z.infer<typeof createAcademicHistorySchema>;
export type UpdateAcademicHistoryObj = z.infer<typeof updateAcademicHistorySchema>;
