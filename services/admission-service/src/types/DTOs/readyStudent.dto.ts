import {GenderEnum, IdTypeEnum} from "../index";

import {
    ArrayMinSize,
    IsArray,
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer';
import {ReadyAddressDto} from "./readyAddress.dto";
import {ReadyAcademicHistoryDto} from "./readyAcademicHistory.dto";
import {ReadyDocumentsDto} from "./readyDocuments.dto";
import {ReadyEnrollmentDto} from "./readyEnrollment.dto";
import {ReadyNextOfKinDto} from "./readyNextOfKin.dto";

class ReadyApplicantDto {
    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(IdTypeEnum)
    idType?: IdTypeEnum;

    @IsOptional()
    @IsString()
    idNumber?: string;

    @IsNotEmpty({message: "Please select gender!"})
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthDay?: Date;

    @IsObject()
    @Type(() => ReadyAddressDto)
    address!: ReadyAddressDto;

    @IsObject()
    @ValidateNested()
    @Type(() => ReadyAcademicHistoryDto)
    academicHistory!: ReadyAcademicHistoryDto;

    @IsObject()
    @ValidateNested()
    @Type(() => ReadyEnrollmentDto)
    enrollments!: ReadyEnrollmentDto[];

    @IsArray()
    @ArrayMinSize(1, {message: "At least one next of kin is required!"})
    @ValidateNested({each: true})
    @Type(() => ReadyNextOfKinDto)
    nextOfKins!: ReadyNextOfKinDto[];

    @IsObject()
    @ValidateNested()
    @Type(() => ReadyDocumentsDto)
    documents!: ReadyDocumentsDto;
}

export default ReadyApplicantDto