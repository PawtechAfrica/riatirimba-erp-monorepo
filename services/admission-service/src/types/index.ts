/**
 * Global type definitions for the application
 */

import express, {NextFunction} from "express";
import {IntakeStatus} from "../database/entities/Intake.entity";
import {ApplicantDocuments} from "../database/entities/ApplicantDocument.entity";
import {Address} from "../database/entities/Address.entity";
import {Enrollment} from "../database/entities/Enrollment.entity";
import {Collection} from "@mikro-orm/core";

/**
 * Applicant data interface combining all relevant information
 */

export interface NextOfKinObj {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    relationship: string;
}

export enum TertiaryLevel {
    CERTIFICATE = "cert",
    DIPLOMA = "dip",
    DEGREE = "deg",
}

export interface IntakeObj {
    id: number;
    period: IntakePeriodEnum;
    opens?: Date;
    closes?: Date;
    status?: IntakeStatus;
    periodYearKey?: string;
}

export interface DocumentObj {
    id: number;
    documentKey: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppRequest extends express.Request {
    user?: {
        sub: number,
        email: string,
        role: 'principal' | 'admin' | 'applicant',
        permissions: string[],
        iat: number,
        exp: number
    }
}

// controller
export type appController = (
    request: AppRequest,
    response: express.Response,
    next: NextFunction,
) => void | Promise<void> | Promise<express.Response>;

export enum GenderEnum {
    MALE = "M",
    FEMALE = "F",
}

export enum BasicEducationEnum {
    PRIMARY_SCHOOL = "primary",
    HIGH_SCHOOL = "secondary",
    TERTIARY = 'tertiary',
}

export enum GradeEnum {
    A_PLAIN = "A",
    A_MINUS = "A-",
    B_PLUS = "B+",
    B_PLAIN = "B",
    B_MINUS = "B-",
    C_PLUS = "C+",
    C_PLAIN = "C",
    C_MINUS = "C-",
    D_PLUS = "D+",
    D_PLAIN = "D",
    D_MINUS = "D-",
    E = "E",
}

export enum ExamBodyEnum {
    KNEC = 'KNEC',
    CDACC = 'CDACC'
}

export enum IntakePeriodEnum {
    JANUARY_INTAKE = "JAN",
    MAY_INTAKE = "MAY",
    SEPTEMBER_INTAKE = "SEP",
}

export enum StudentTypeEnum {
    KUCCPS__GOVT_SPONSORED = "KUCCPS",
    PrivateSponsored = "PSS",
    NYS_Sponsored = "NYS",
}

export enum IdTypeEnum {
    BIRTH_CERTIFICATE = "birthCertificate",
    NATIONAL_ID = "nationalId",
}

export type AcademicHistoryObj = {
    primarySchool: string;
    highestEducationLevel: BasicEducationEnum | null;
    // kcseGrade: GradeEnum;
    newApplicant: false;
    admissionNumber?: string;
} & (
    | {
    basicEducationLevel: BasicEducationEnum.PRIMARY_SCHOOL;
    kcpeIndexNumber: string;
}
    | {
    basicEducationLevel: BasicEducationEnum.HIGH_SCHOOL;
    kcseGrade: GradeEnum;
    kcseIndexNumber: string;
    highSchool: string;
}
    );

export interface AddressObj {
    id: number;
    county?: string;
    location?: string;
    subLocation?: string;
    village?: string;
}

export type ReadyApplicantObj = {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    // Phone must match regex: /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/
    phone?: string;
    idType?: IdTypeEnum;
    idNumber?: string;
    gender?: GenderEnum;
    birthDay?: Date;
    age: number | null; // Computed: age based on dateOfBirth
    address: AddressObj;
    nextOfKin: Partial<NextOfKinObj>;
    academicHistory: Partial<AcademicHistoryObj>;
    primarySchool?: string;
    admissionNumber?: string;

    course: number | null;
    intake?: IntakeObj;
    documents: ApplicantDocuments[];
} & (
    | {
    highSchool?: string;
    kcseGrade: GradeEnum | null;
    kcseIndexNumber?: string;
}
    | {
    kcpeIndexNumber?: string;
}
    );

export interface ApplicationObj {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    // Phone must match regex: /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/
    phone?: string;
    // @deprecated todo: remove in later iteration
    idType?: IdTypeEnum;
    // @deprecated todo: remove in later iteration
    idNumber?: string;
    nationalId?: string | null;
    birthCertNumber: string | null
    gender?: GenderEnum;
    birthDay?: Date;
    dateOfBirth: string; // Computed: formatted dateOfBirth (e.g., "D MMMM YYYY")
    age: number | null; // Computed: age based on dateOfBirth

    address: Address;
    nextOfKin: Partial<NextOfKinObj>;
    academicHistory: Partial<AcademicHistoryObj>;
    enrollments: Collection<Enrollment>;
    // course: number | null;
    // intake?: IntakeObj;
    documents: ApplicantDocuments;
    admitted: boolean;
    migrated: boolean;
    completionStatus: number;
}

export type PaginatedResponse<T> = {
    page: number;
    pageSize: number;
    lastPageIs: number;
    data: T[];
};

export type FormSteps = 'profile' | 'address' | 'next-of-kin' | 'ac-history' | 'enrollment' | 'docs'

export type ApplicantExcelKey =
    | "id"
    | "age"
    | "birthDay"
    | "email"
    | "completionStatus"
    | "createdAt"
    | "dateOfBirth"
    | "deleted"
    | "addr_county"
    | "addr_location"
    | "addr_poBox"
    | "addr_subLocation"
    | "addr_village"
    | "addr_zipCode"
    | "edu_highSchool"
    | "edu_highestEducationLevel"
    | "edu_kcpeIndexNumber"
    | "edu_kcseGrade"
    | "edu_kcseIndexNumber"
    | "edu_primarySchool"
    | "edu_tertiaryLevel"
    | "edu_tertiarySchool"
    | "firstName"
    | "gender"
    | "idNumber"
    | "idType"
    | "lastName"
    | "middleName"
    | "migrated"
    | "pending"
    | "phone"
    | "pinNumber"
    | "submitted"
    | "updatedAt"
    | "enrol_admissionNumber"
    | "enrol_course"
    | "enrol_createdAt"
    | "enrol_examiningBody"
    | "enrol_intake"
    | "enrol_newApplicant"
    | "enrol_studentType"
    | "enrol_yearOfStudy"
    | "nok1_relationship"
    | "nok1_email"
    | "nok1_firstName"
    | "nok1_lastName"
    | "nok1_phone"
    | "nok2_email"
    | "nok2_firstName"
    | "nok2_lastName"
    | "nok2_phone"
    | "nok2_relationship"

export interface IntakeFilterQuery {
    [key: string]: string | number | IntakeStatus | undefined;

    opens?: string;
    year?: number;
    status?: IntakeStatus
}

