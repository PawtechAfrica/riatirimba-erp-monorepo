import {AxiosError} from "axios";


export enum GenderEnum {
    MALE = "M",
    FEMALE = "F",
}

export type FormSteps = 'profile' | 'address' | 'next-of-kin' | 'ac-history' | 'enrollment' | 'docs';

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

export enum TertiaryLevel {
    CERTIFICATE = "cert",
    DIPLOMA = "dip",
    DEGREE = "deg",
}

export enum IntakePeriodEnum {
    JANUARY_INTAKE = "JAN",
    MAY_INTAKE = "MAY",
    SEPTEMBER_INTAKE = "SEP",
}

export type IntakeObj = {
    id: number;
    period: IntakePeriodEnum,
    periodYearKey: string;
    year: number;
    opens?: string;
    closes?: string;
    status: IntakeStatusObj,
    readable: string
}


export type AcademicHistoryObj = {
    "id": number,
    "highestEducationLevel": BasicEducationEnum | null,
    "kcseIndexNumber": string | null,
    "kcpeIndexNumber": string,
    "primarySchool": string | null,
    "highSchool": string | null,
    "tertiarySchool": string | null,
    "kcseGrade": GradeEnum | null,
    "tertiaryLevel": TertiaryLevel | null,
}

export interface EnrollmentObj {
    id: number;
    course: number | null;
    intake: string | null | IntakeObj;
    newApplicant: boolean | null;
    admissionNumber: string | null;
    yearOfStudy: string | null;
    studentType: StudentTypeEnum | null;
    examiningBody: ExamBody | null;
}

/**
 * Comprehensive interface containing all fields from the 6-Step forms
 * with their relevant data types as generated after getData function
 */
export interface ApplicantData {
    "id": string,
    "firstName": string,
    "middleName": string | null,
    "lastName": string,
    "email": string,
    "phone": string,
    // "idType": IdTypeEnum | null,
    "idNumber": string | null,
    'birthCertNumber': string | null,
    "gender": GenderEnum | null,
    "pinNumber": string | null,
    "pending": boolean,
    "migrated": boolean,
    "documents": ApplicantDocuments,
    "address": AddressObj,
    "academicHistory": AcademicHistoryObj,
    "enrollments": EnrollmentObj,
    "completionStatus": number,
    "submitted": boolean,
    "nextOfKins": NextOfKinObj[],
    "dateOfBirth": string | null,
    "age": number
}

export enum IdTypeEnum {
    BIRTH_CERTIFICATE = "birthCertificate",
    NATIONAL_ID = "nationalId",
}

export type ApplicantDocuments = {
    "id": number,
    "kcseCertificate": string | null,
    "kcpeCertificate": string | null,
    "birthCertificate": string | null,
    "nationalId": string | null,
    "passportPhoto": string | null,
    "tertiaryCertificate": string | null
}

export enum ExamBody {
    KNEC = 'KNEC',
    CDACC = 'CDACC'
}

export type ApplicantDocumentInputObj = {
    [K in keyof ApplicantDocuments]?: File | null;
};
export type FileInputValidator = (file: File | null, ...args: any[]) => Promise<boolean>;

export interface NextOfKinObj {
    [key: string]: string;

    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
}

export interface AddressObj {
    "id": 2,
    "zipCode": number | null,
    "poBox": number | null,
    "county": string | null,
    "location": string | null,
    "subLocation": string | null,
    "village": string | null
}

export type CourseObj = {
    id: number;
    code: string;
    name: string;
    level: number;
    entryRequirements: string;
    examBody: string;
    duration: number; // in month
    departmentId: number;
};

export type DepartmentObj = {
    id: number;
    name: string;
    courses: Array<CourseObj>;
};

export enum StudentTypeEnum {
    KUCCPS__GOVT_SPONSORED = "KUCCPS",
    PrivateSponsored = "PSS",
    NYS_Sponsored = "NYS",
}

export enum BasicEducationEnum {
    PRIMARY_SCHOOL = "primary",
    HIGH_SCHOOL = "secondary",
    TERTIARY = 'tertiary',
}

export type SignupDataObj = {
    [key: string]: string | null | BasicEducationEnum;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    kcpeIndexNumber: string;
};

export interface ValidationObj {
    property: string;
    message: string;
}

export class FormError extends AxiosError {
    public validations: Record<string, string>
    public serverMessage: string;

    constructor(message: string, validations: ValidationObj[] = []) {
        super();
        this.serverMessage = message ?? "Something went wrong";
        this.validations = Object.fromEntries(validations.map(v => [v.property, v.message]));
    }
}