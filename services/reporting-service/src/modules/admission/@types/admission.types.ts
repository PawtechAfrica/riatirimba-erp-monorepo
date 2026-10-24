export enum IdTypeEnum {
    BIRTH_CERTIFICATE = 'birthCertificate',
    NATIONAL_ID = 'nationalId',
}

export enum GenderEnum {
    MALE = 'M',
    FEMALE = 'F',
}

export interface AddressObj {
    id: number;
    zipCode?: string;
    poBox?: string;
    county?: string;
    location?: string;
    subLocation?: string;
    village?: string;
}

export interface NextOfKinObj {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    relationship: string;
}
export enum BasicEducationEnum {
    PRIMARY_SCHOOL = 'primary',
    HIGH_SCHOOL = 'secondary',
    TERTIARY = 'tertiary',
}
export enum GradeEnum {
    A_PLAIN = 'A',
    A_MINUS = 'A-',
    B_PLUS = 'B+',
    B_PLAIN = 'B',
    B_MINUS = 'B-',
    C_PLUS = 'C+',
    C_PLAIN = 'C',
    C_MINUS = 'C-',
    D_PLUS = 'D+',
    D_PLAIN = 'D',
    D_MINUS = 'D-',
    E = 'E',
}
export type AcademicHistoryObj = {
    primarySchool: string;
    basicEducationLevel: BasicEducationEnum | null;
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

export enum ExamBodyEnum {
    KNEC = 'KNEC',
    CDACC = 'CDACC',
}

export enum StudentTypeEnum {
    KUCCPS__GOVT_SPONSORED = 'KUCCPS',
    PrivateSponsored = 'PSS',
    NYS_Sponsored = 'NYS',
}

export interface Enrollment {
    [key: string]:
        | number
        | null
        | boolean
        | string
        | ExamBodyEnum
        | StudentTypeEnum
        | Date;
    id: number;
    course: number | null;
    intake: number | null;
    newApplicant: boolean | null;
    admissionNumber: string | null;
    yearOfStudy: number | null;
    examiningBody: ExamBodyEnum | null;
    studentType: StudentTypeEnum | null;
    createdAt: Date;
}

export interface ApplicantObj {
    [key: string]:
        | string
        | number
        | null
        | Date
        | IdTypeEnum
        | GradeEnum
        | undefined
        | GenderEnum
        | boolean
        | AddressObj
        | Array<Partial<NextOfKinObj>>
        | Partial<AcademicHistoryObj>
        | Enrollment;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    // Phone must match regex: /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/
    phone?: string;
    birthCertNumber?: string;
    pending?: boolean;
    idNumber?: string;
    gender?: GenderEnum;
    // birthDay?: Date;
    dateOfBirth: string; // Computed: formatted dateOfBirth (e.g., "D MMMM YYYY")
    age: number | null; // Computed: age based on dateOfBirth

    address: AddressObj;
    nextOfKins: Array<Partial<NextOfKinObj>>;
    academicHistory: Partial<AcademicHistoryObj>;
    enrollments: Enrollment;
    // course: number | null;
    // intake?: IntakeObj;
    // documents: ApplicantDocuments;
    admitted: boolean;
    migrated: boolean;
    completionStatus: number;
}
export type ApplicantsRecordKeys =
    | 'id'
    // Base Info
    | 'firstName'
    | 'middleName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'birthCertNumber'
    | 'idNumber'
    | 'gender'
    // | 'birthDay'
    | 'pinNumber'
    // Contact/Location
    | 'zipCode'
    | 'poBox'
    | 'county'
    | 'location'
    | 'subLocation'
    | 'village'
    // Academic
    | 'highestEducationLevel'
    | 'kcseIndexNumber'
    | 'kcpeIndexNumber'
    | 'primarySchool'
    | 'highSchool'
    | 'tertiaryLevel'
    | 'tertiarySchool'
    | 'kcseGrade'
    // Enrollment
    | 'course'
    | 'newApplicant'
    | 'intake'
    | 'dateOfBirth'
    | 'admissionNumber'
    | 'yearOfStudy'
    | 'examiningBody'
    | 'studentType'
    // Next of Kin
    | 'nok1FirstName'
    | 'nok1LastName'
    | 'nok1Phone'
    | 'nok1Email'
    | 'nok1Relationship'
    | 'nok2FirstName'
    | 'nok2LastName'
    | 'nok2Phone'
    | 'nok2Email'
    | 'nok2Relationship'
    // Metadata
    | 'submitted'
    | 'completionStatus'
    | 'migrated'
    | 'pending'
    | 'createdAt'
    | 'updatedAt';
