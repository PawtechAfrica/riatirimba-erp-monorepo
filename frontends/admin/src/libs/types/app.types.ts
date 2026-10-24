import {
    type ApplicantQueryFilter,
    type ApplicationObj,
    type IntakeObj,
    TraineeTypeEnum
} from "@/libs/types/admission.types.ts";
import {AxiosError} from "axios";
import {
    EnrollmentStatusEnum,
    ModuleStatusEnum,
    type TraineeObj,
    type TraineeQueryFilter
} from "@/libs/types/trainee.types.ts";

export enum ExamBody {
    KNEC = 'KNEC',
    CDACC = 'CDACC'
}

export class FormError extends AxiosError {
    constructor(e: AxiosError, public validationErrors: { property: string, message: string }[]) {
        super(e.message, e.code, e.config, e.request, e.response);
    }
}

export type PaginatedResponse<T> = {
    page: number;
    pageSize: number;
    lastPageIs: number;
    data: T[];
};
export type ApiResponse<T> = {
    message: string;
    data: T;
}

export interface CourseModuleDTO {
    id: string;
    termNumber: number;
    moduleNumber: number;
    enrollment: bigint;
    academicYear: number | null;
    status: ModuleStatusEnum | null;
    completedAt: string | Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type EnrollmentObj<T> = {
    id: number;
    course: number | null;
    intake: T extends TraineeObj ? (string | null) : string | IntakeObj | null;
    newApplicant: boolean | null;
    admissionNumber: string | null;
    studentType: TraineeTypeEnum | null;
    yearOfStudy: number | null;
    examiningBody: ExamBody | null
} & (T extends TraineeObj ? {
    admissionNumber: string;
    createdAt: Date | null;
    status: EnrollmentStatusEnum | null;
    modules: CourseModuleDTO[]
} : { admissionDate: Date | null })

export type EnrollmentObjInput<T> = {
    id: number;
    course: string | null;
    intake: T extends TraineeObj ? (string | null) : string | IntakeObj | null;
    newApplicant: "1" | "" | null;
    admissionNumber: string | null;
    studentType: TraineeTypeEnum | null;
    yearOfStudy: string | null;
    examiningBody: ExamBody | null
} & (T extends TraineeObj ? {
    createdAt: Date | null;
    modules: CourseModuleDTO[]
} : { admissionDate: Date | null })

export type ApplicantsRecordKeys =
    | 'id'
    // Base Info
    | 'firstName' | 'middleName' | 'lastName' | 'email' | 'phone'
    | 'birthCertNumber' | 'idNumber' | 'gender' | 'pinNumber'
    // Contact/Location
    | 'zipCode' | 'poBox' | 'county' | 'location' | 'subLocation' | 'village'
    // Academic
    | 'highestEducationLevel' | 'kcseIndexNumber' | 'kcpeIndexNumber'
    | 'primarySchool' | 'highSchool' | 'tertiaryLevel' | 'tertiarySchool' | 'kcseGrade'
    // Enrollment
    | 'course' | 'newApplicant' | 'intake' | 'dateOfBirth' | 'admissionNumber'
    | 'yearOfStudy' | 'examiningBody' | 'studentType'
    // Next of Kin
    | 'nok1FirstName' | 'nok1LastName' | 'nok1Phone' | 'nok1Email' | 'nok1Relationship'
    | 'nok2FirstName' | 'nok2LastName' | 'nok2Phone' | 'nok2Email' | 'nok2Relationship'
    // Metadata
    | 'submitted' | 'completionStatus' | 'migrated' | 'pending' | 'createdAt' | 'updatedAt';


export type FilterStoreState<TargetGroup extends ApplicationObj | TraineeObj> = {
    page: number | 1;
    filters: TargetGroup extends ApplicationObj ? ApplicantQueryFilter : TraineeQueryFilter,
    setFilter: (field: Partial<TargetGroup extends ApplicationObj ? ApplicantQueryFilter : TraineeQueryFilter>) => void;
    resetFilter: () => void,
    lastPage: number | 1;
    pageSize: number | 100;
    isFiltersOn: boolean;
    flipPage: (page: number) => void;
    // setFilterMode(active?: boolean): void;
    list: Map<number, Map<string, TargetGroup>>
    filterTargetGroup: (filter: TargetGroup extends ApplicationObj ? ApplicantQueryFilter : TraineeQueryFilter, intake: string | 'all') => Promise<PaginatedResponse<TargetGroup extends ApplicationObj ? ApplicationObj : TraineeObj>>
}
