import {
    IsArray,
    IsBoolean,
    IsDate,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import {Expose, Transform} from "class-transformer";
import {GenderEnum, IdTypeEnum, EnrollmentStatusEnum} from "../../database/@types.database";
import {AddressResponseDto, CreateAddressDto, UpdateAddressDto} from "./address.dto";
import {CreateNextOfKinDTO, NextOfKinResponseDTO, UpdateNextOfKinDTO} from "./nextOfKin.dto";
import {AcademicHistoryResponseDto, CreateAcademicHistoryDto, UpdateAcademicHistoryDto} from "./academicHistory.dto";
import {CreateStudentDocumentDto} from "./studentDocument.dto";
import {CoursesResponseDTO, CreateEnrollmentDTO, UpdateEnrollmentDTO} from "./Courses.dto";
import dayjs from "dayjs";

export class CreateStudentDTO {
    @IsNotEmpty()
    @IsString()
    @Transform((obj) => obj.value?.trim())
    firstName!: string;

    @IsOptional()
    @IsString()
    @Transform((obj) => obj.value?.trim())
    middleName?: string;

    @IsNotEmpty()
    @IsString()
    @Transform((obj) => obj.value?.trim())
    lastName!: string;

    @IsNotEmpty()
        // @IsPhoneNumber(undefined)
    phone!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    // @deprecated todo: Remove in the next iteration
    @IsOptional()
    @IsEnum(IdTypeEnum)
    idType!: IdTypeEnum;
    // @deprecated todo: Remove in the next iteration
    @IsOptional()
    @IsString()
    idNumber!: string;

    @IsNotEmpty()
    @IsString()
    birthCertNumber!: string;

    @IsNotEmpty()
    @IsEnum(GenderEnum)
    gender!: GenderEnum;

    @IsNotEmpty()
    @IsDate()
    birthday!: Date;

    @IsNotEmpty()
    @ValidateNested()
    address!: CreateAddressDto;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each: true})
    nextOfKins!: CreateNextOfKinDTO[];

    @IsNotEmpty()
    @ValidateNested()
    academicHistory!: CreateAcademicHistoryDto;

    @IsOptional()
    @IsString()
    @Transform((tar) => (tar.value ? tar.value : undefined))
    nemisCode?: string;

    @IsNotEmpty()
    @IsBoolean()
    newApplicant!: boolean;

    @IsOptional()
    @IsEnum(EnrollmentStatusEnum)
    status?: EnrollmentStatusEnum;

    @IsOptional()
    @IsString()
    @Transform((tar) => (tar.value ? tar.value : undefined))
    pinNumber?: string;

    @IsNotEmpty()
    @ValidateNested({each: true})
    enrollments!: CreateEnrollmentDTO[];

    @IsOptional()
    @ValidateNested({each: true})
    documents!: CreateStudentDocumentDto[];
}

export class UpdateStudentDTO {
    @IsOptional()
    @IsString()
    @Transform((obj) => (typeof obj.value === "string" ? obj.value?.trim() : undefined))
    firstName?: string;

    @IsOptional()
    @IsString()
    @Transform((obj) => (typeof obj.value === "string" ? obj.value?.trim() : undefined))
    middleName?: string;

    @IsOptional()
    @IsString()
    @Transform((obj) => (typeof obj.value === "string" ? obj.value?.trim() : undefined))
    lastName?: string;

    @IsOptional()
    // @IsPhoneNumber(undefined)
    @Transform((obj) => (typeof obj.value === "string" ? obj.value?.trim() : undefined))
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    // @IsEnum(IdTypeEnum)
    // idType?: IdTypeEnum;
    @IsString()
    birthCertNumber!: string;

    @IsOptional()
    @IsString()
    idNumber?: string;

    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @IsOptional()
    @ValidateNested()
    address?: UpdateAddressDto;

    @IsOptional()
    @ValidateNested({each: true})
    nextOfKin?: UpdateNextOfKinDTO[];

    @IsOptional()
    @ValidateNested()
    academicHistory?: UpdateAcademicHistoryDto;

    @IsOptional()
    @IsString()
    @Transform((tar) => (tar.value ? tar.value : undefined))
    nemisCode?: string;

    @IsOptional()
    @IsBoolean()
    newApplicant!: boolean;

    @IsOptional()
    @IsEnum(EnrollmentStatusEnum)
    status?: EnrollmentStatusEnum;

    @IsOptional()
    @IsString()
    @Transform((tar) => (tar.value ? tar.value : undefined))
    pinNumber?: string;

    @IsOptional()
    @ValidateNested({each: true})
    enrollments!: UpdateEnrollmentDTO[];
}

export class StudentResponseDTO {
    @Expose()
    firstName!: string;
    @Expose()
    middleName?: string;
    @Expose()
    lastName!: string;
    @Expose()
    email!: string;
    @Expose()
    idNumber?: string;
    @Expose()
    phone!: string;
    @Expose()
    @Transform((targ) => dayjs(targ.value).format("DD MMMM YYYY"))
    dateOfBirth!: string;
    @Expose()
    age!: number;
    @Expose()
    nemisCode?: string;
    @Expose()
    pinNumber?: string;
    @Expose()
    status!: EnrollmentStatusEnum;
    @Expose()
    address!: AddressResponseDto;
    @Expose()
    nextOfKins!: NextOfKinResponseDTO[];
    @Expose()
    academicHistory!: AcademicHistoryResponseDto;
    @Expose()
    newApplicant!: boolean;
    @Expose()
    enrollments!: CoursesResponseDTO[];
}
