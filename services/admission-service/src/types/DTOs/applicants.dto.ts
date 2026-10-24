import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    ValidateNested
} from "class-validator";
import {GenderEnum, IdTypeEnum} from "../index";
import {CreateAddressDto} from "./address.dto";
import {Expose, Transform} from "class-transformer";
import dayjs from "dayjs";
import {CreateEnrollmentDTO} from "./enrollment.dto";
import {CreateNextOfKinDTO} from "./nextOfKin.dto";
import {CreateAcademicHistoryDTO} from "./academicHistory.dto";


export class ApplicantLoginDTO {
    @IsNotEmpty()
    @IsString()
    email!: string;
    @IsNotEmpty()
    @IsString()
    indexNumber!: string;
}

export class ApplicantSignupDTO {
    @IsNotEmpty()
    @IsString()
    firstName!: string;
    @IsNotEmpty()
    @IsString()
    lastName!: string;
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    @IsNotEmpty()
    @IsString()
        // @IsPhoneNumber(undefined, {message: "Use international format. E.g. +2548012345678"})
    phone!: string;
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?:\d{11}|\d{9})\/\d{4}$/, {message: "KCPE index number must be in format index/year E.g. 12345678901/2020"})
    kcpeIndexNumber!: string;
}


export class CreateApplicantDTO {
    @IsNotEmpty()
    @IsString()
    firstName!: string;
    @IsOptional()
    @IsString()
    middleName!: string;
    @IsNotEmpty()
    @IsString()
    lastName!: string;
    @IsNotEmpty()
    @Transform(data => data.value ? data.value.toLowerCase() : undefined)
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
        // @IsPhoneNumber(undefined, {message: "Use international format. E.g. +2548012345678"})
    phone!: string;

    // @IsOptional()
    // @IsEnum(IdTypeEnum)
    // idType?: IdTypeEnum;
    @IsOptional()
    @IsString()
    birthCertNumber?: string;

    @IsOptional()
    @IsString()
    idNumber?: string;

    @IsNotEmpty({message: "Invalid request!"})
    @ValidateNested({always: true})
    academicHistory!: CreateAcademicHistoryDTO;

    @IsOptional()
    @ValidateNested()
    address?: CreateAddressDto;

    @IsOptional()
    @IsDateString()
    @Transform(targ => dayjs(targ.value).isValid() ? new Date(targ.value) : undefined)
    birthDay?: Date;

    // @IsOptional()
    // @ValidateNested()
    // documents?: CreateApplicantDocDTO;

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    enrollment?: CreateEnrollmentDTO;

    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @IsOptional()
    @ValidateNested()
    nextOfKins?: CreateNextOfKinDTO[];
}

export class UpdateApplicantProfileDTO {
    @IsNotEmpty()
    @IsString()
    firstName!: string;
    @IsOptional()
    @IsString()
    middleName!: string;
    @IsNotEmpty()
    @IsString()
    lastName!: string;
    @IsNotEmpty()
    @Transform(data => data.value ? data.value.toLowerCase() : undefined)
    @IsEmail()
    email!: string;
    @IsNotEmpty()
    @IsString()
        // @IsPhoneNumber(undefined, {message: "Use international format. E.g. +2548012345678"})
    phone!: string;
    @IsOptional()
    @IsEnum(IdTypeEnum)
    idType?: IdTypeEnum;
    @IsOptional()
    @IsString()
    birthCertNumber?: string;
    @IsOptional()
    @IsString()
    nationalId?: string;

    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    idNumber?: string;

}

export class UpdateApplicantDTO extends CreateApplicantDTO {
    @IsNotEmpty()
    @IsString()
    id!: string;

    @IsOptional()
    @IsBoolean()
    pending?: boolean;

    @IsOptional()
    @IsBoolean()
    migrated?: boolean;
}

export class ApplicantResponseDTO extends UpdateApplicantDTO {
    @Expose()
    @IsOptional()
    @IsNumber()
    age!: number | null;

    @Expose()
    @IsNumber()
    completionStatus!: number;

    @Expose()
    createdAt!: Date;

    @Expose()
    @IsString()
    dateOfBirth!: string;

    @Expose()
    @IsBoolean()
    submitted!: boolean;
}

export class DeleteApplicantDTO {
    @IsNotEmpty({message: "Please select at least one applicant"})
    @IsArray({message: "Invalid request!"})
    @IsString({each: true})
    @ValidateNested({each: true})
    body!: string[];
}

