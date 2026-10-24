import type {IconType} from "react-icons";
import type {EnrollmentObj} from "@/libs/types/app.types.ts";
import type {DateValue} from "@mantine/dates";
import type {FileRoutesByTo} from "@/routeTree.gen.ts";
import type {BaseQueryFilter} from "@/libs/types/shared.types.ts";

export interface LinkGroupObj {
    label: string;
    path: keyof FileRoutesByTo;
    icon?: IconType;
    params?: Record<string, any>,
    search?: Record<string, any>,
    childPaths?: LinkGroupObj[];
    permissions?: string | string[];
}

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Personal information interface
 */
export interface PersonalInfo {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    birthDay: Date;
}

/**
 * Contact information interface
 */
export interface ContactInfo {
    email: string;
    phone: string;
}

/**
 * Name information interface
 */
export interface NameInfo {
    firstName: string;
    middleName?: string;
    lastName: string;
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

export enum GenderEnum {
    MALE = "M",
    FEMALE = "F",
}

export enum TertiaryLevel {
    CERTIFICATE = "cert",
    DIPLOMA = "dip",
    DEGREE = "deg",
}

export enum IdTypeEnum {
    BIRTH_CERTIFICATE = "birthCertificate",
    NATIONAL_ID = "nationalId",
}

export enum TraineeTypeEnum {
    KUCCPS__GOVT_SPONSORED = "KUCCPS",
    PrivateSponsored = "PSS",
    NYS_Sponsored = "NYS",
}

export enum BasicEducationEnum {
    PRIMARY_SCHOOL = "primary",
    HIGH_SCHOOL = "secondary",
    TERTIARY = "tertiary",
}

export type AcademicHistoryObj = {
    id?: number;
    highestEducationLevel: BasicEducationEnum | null;
    kcseIndexNumber: string | null;
    kcpeIndexNumber: string;
    primarySchool: string | null;
    highSchool: string | null;
    tertiarySchool: string | null;
    kcseGrade: GradeEnum | null;
    tertiaryLevel: TertiaryLevel | null;
};


export type ApplicantDocuments = {
    id: number;
    kcseCertificate: string | null;
    kcpeCertificate: string | null;
    birthCertificate: string | null;
    nationalId: string | null;
    passportPhoto: string | null;
    tertiaryCertificate: string | null;
};

export interface NextOfKinObj {
    // [key: string]: string; // allow dynamic fields
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
}

export interface AddressObj {
    id: number;
    zipCode: number | null;
    poBox: number | null;
    county: string | null;
    location: string | null;
    subLocation: string | null;
    village: string | null;
}

/**
 * Applicant data interface combining all relevant information
 */
export interface ApplicationObj {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    phone: string;
    idType: IdTypeEnum | null;
    idNumber: string | null;
    birthCertNumber: string | null;
    gender: GenderEnum | null;
    pinNumber: string | null;
    pending: boolean;
    migrated: boolean;
    documents?: ApplicantDocuments;
    address?: AddressObj;
    academicHistory?: AcademicHistoryObj;
    enrollments?: EnrollmentObj<ApplicationObj>;
    completionStatus: number;
    submitted: boolean;
    nextOfKins: NextOfKinObj[];
    dateOfBirth: string | null;
    age: number;
    admissionErrors: AdmissionErrorsRecords | null
}

export interface UpdateApplicationObj {
    id: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    email?: string;
    phone?: string;
    idType?: IdTypeEnum | null;
    idNumber?: string | null;
    birthCertNumber?: string | null;
    gender?: GenderEnum | null;
    pinNumber?: string | null;
    pending?: boolean;
    migrated?: boolean;
    documents?: ApplicantDocuments;
    completionStatus?: number;
    submitted?: boolean;
    nextOfKins?: NextOfKinObj[];
    dateOfBirth?: string | null;
    age?: number;
    admissionErrors?: AdmissionErrorsRecords | null
    enrollments?: Partial<EnrollmentObj<ApplicationObj>>;
    address?: Partial<AddressObj>;
    academicHistory?: Partial<AcademicHistoryObj>;
}

export interface AdmissionErrorsRecords {
    "id": number,
    "errors": AdmissionErrorObj[],
    "updatedAt": string,
}

export type AdmissionErrorObj = {
    property: string;
    message: string;
}

export interface BaseLocationObj {
    id: number;
    name: string;
}

export interface IntakeObj {
    id: number;
    periodYearKey: string;
    period: IntakePeriodEnum;
    year: number;
    opens?: string;
    closes?: string;
    status: IntakeStatus;
    readable: string;
    createdAt: string;
    closed?: boolean;
}

export interface SystemUserObj {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions?: PermissionObj[];
}

export enum IntakePeriodEnum {
    JANUARY_INTAKE = "JAN",
    MAY_INTAKE = "MAY",
    SEPTEMBER_INTAKE = "SEP",
}

export interface IntakeObjInput {
    period: IntakePeriodEnum | null;
    year: DateValue | Date | null
    periodYearKey: string | null;
    opens: null | Date | string;
    closes: null | Date | string;
    closed: boolean;
}

export enum IntakeStatus {
    UPCOMING = "upcoming",
    OPEN = "open",
    CLOSED = "closed",
    OVERDUE = "overdue",
}

export interface RequiredDocuments {
    [key: string]: undefined | DocumentObj;

    passportPhoto?: DocumentObj;
    idCopy?: DocumentObj;
    birthCert?: DocumentObj;
    kcseLeavingCert?: DocumentObj;
}

export interface DocumentObj {
    id: number;
    documentKey: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CourseObj = {
    id: number;
    name: string;
    code: string;
    level: number;
    duration: number;
};

export type DepartmentObj = {
    id: number;
    name: string;
    courses: Array<CourseObj>;
};

export type ApplicantFilter = {
    [key: string]: string | null | boolean | number;
    intake: string | null;
    course: string | null;
    newApplicant: boolean | null;
    completion: number | null;
};

export type PermissionObj = {
    [key: string]: number | string | undefined;
    id: number;
    name: string;
    description?: string;
};

export interface AdmissionStatsObj {
    id: number;
    intake: IntakeObj;

    applicantsCount: Record<string, 1>;
    genderCount: Record<string, GenderEnum>;
    acceptanceByGender: Record<string, GenderEnum>;
    applicantGrades: Record<string, GradeEnum>;
    completeApplications: Record<string, 1>;
    courses: Record<string, number>;
    ages: Record<string, number>;
    migrationCount: Record<string, number>;

    totalAccepted: number;
    acceptanceScore: number;

    // Optional: allow arbitrary keys that match the general pattern
    [key: string]:
        | Record<string, number | string | GradeEnum | GenderEnum>
        | IntakeObj
        | number;
}


export interface ApplicantQueryFilter extends BaseQueryFilter {
    [key: string]: string | number | boolean | null | undefined | number[];

    migrated?: boolean | null;
    pending?: boolean | null;
    submitted?: boolean | null;
    completed?: boolean | null;
    incomplete?: boolean | null;
}


export interface IntakeApplicantsObj {
    M: number;
    F: number;
    unspecified: number;
}

export interface IntakeStatObj {
    [key: string]: string | number | IntakeApplicantsObj;

    monthYear: string;
    applicants: IntakeApplicantsObj;
    total: number;
    admitted: number;
    acceptanceRate: number;
}

export type IntakeYearStatObj = {
    [year: string]: {
        [intakeId: string]: IntakeStatObj;
    };
};

