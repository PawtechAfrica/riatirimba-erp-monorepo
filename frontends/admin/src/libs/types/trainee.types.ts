import {
    type AcademicHistoryObj,
    type AddressObj,
    type DocumentObj,
    GenderEnum,
    IdTypeEnum,
    type NextOfKinObj,
    TraineeTypeEnum
} from "@/libs/types/admission.types.ts";
import {type AxiosResponse} from "axios";
import type {BaseQueryFilter} from "@/libs/types/shared.types.ts";
import type {EnrollmentObj, PaginatedResponse} from "@/libs/types/app.types.ts";

/**
 * @description Type definition for student object
 */
export interface TraineeObj {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    idType: IdTypeEnum | null;
    gender: GenderEnum | null;
    idNumber?: string;
    phone: string;
    dateOfBirth: string;
    age: number;
    nemisCode?: string;
    pinNumber?: string;
    status: TraineeStatusEnum;
    address: AddressObj | null;
    nextOfKins: NextOfKinObj[];
    academicHistory: AcademicHistoryObj;
    newApplicant: boolean;
    enrollments: EnrollmentObj<TraineeObj>[];
    documents: DocumentObj[];
}

export interface TraineeQueryFilter extends BaseQueryFilter {
    status?: TraineeStatusEnum;
}

export enum TraineeStatusEnum {
    ACTIVE = "active",
    ATTACHMENT = "attachment",
    GRADUATED = "graduated",
    SUSPENDED = "suspended",
    DROPPED_OUT = "dropout",
}
export enum EnrollmentStatusEnum {
    ACTIVE = "active",
    ATTACHMENT = "attachment",
    GRADUATED = "graduated",
    SUSPENDED = "suspended",
    DROPPED_OUT = "dropout",
}

export type FetchTraineesResponse = AxiosResponse<PaginatedResponse<TraineeObj>>;


export class CreateTraineeDTO {
    firstName!: string;
    middleName?: string;
    lastName!: string;
    phone!: string;
    email!: string;
    // idType!: IdTypeEnum | null;
    birthCertNumber!: string | null;
    idNumber!: string;
    gender!: GenderEnum | null;
    birthday!: Date | null;
    address!: CreateAddressDto;
    nextOfKins!: NextOfKinObj[];
    academicHistory!: AcademicHistoryObj;
    nemisCode?: string;
    newApplicant!: boolean;
    status?: TraineeStatusEnum | null;
    pinNumber?: string;
    enrollments?: CreateEnrollmentDTO[];
}

export class CreateEnrollmentDTO {
    course!: number | null;
    yearOfStudy?: number;
    intake!: string | null;
    studentType?: TraineeTypeEnum | null;
    status?: TraineeStatusEnum | null;
}

export class CreateAddressDto {
    poBox!: number | null;
    zipCode!: number | null;
    county!: string | null;
    location!: string | null;
    subLocation!: string | null;
    village!: string | null;
}

export enum TraineeAspect {
    PROFILE = 'profile',
    COURSES = 'courses',
    DOCUMENTS = 'documents'
}


export enum ModuleStatusEnum {
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS",
}
