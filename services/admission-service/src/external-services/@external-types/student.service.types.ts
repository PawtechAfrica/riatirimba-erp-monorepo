import { Address } from "../../database/entities/Address.entity";
import { AcademicHistoryObj, GenderEnum, IdTypeEnum, NextOfKinObj, StudentTypeEnum } from "../../types";

export interface StudentObj {
    id?: string;
    dateOfAdmission?: Date;
    updatedAt?: Date;
    admissionNumber: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    idType: IdTypeEnum;
    idNumber: string;
    gender: GenderEnum;
    birthDay: Date;
    studentType: StudentTypeEnum;
    address: Address;
    nextOfKin: NextOfKinObj;
    academicHistory: AcademicHistoryObj;
    nemisCode?: string | null;
    course: number;
    intake: number;
    yearOfStudy: number;
    deleted?: boolean;
    documents?: [];
}
