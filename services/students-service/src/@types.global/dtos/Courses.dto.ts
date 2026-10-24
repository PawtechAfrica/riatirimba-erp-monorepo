import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {ExamBody, EnrollmentStatusEnum, StudentTypeEnum} from "../../database/@types.database";
import {Transform} from "class-transformer";

export class CreateEnrollmentDTO {
    @IsNotEmpty()
    @IsNumber()
    course!: number;
    @IsOptional()
    @IsNumber()
    yearOfStudy?: number;
    @IsNotEmpty()
    intake!: string;
    @IsNotEmpty()
    @IsEnum(StudentTypeEnum)
    studentType!: StudentTypeEnum;
    @IsOptional()
    @IsEnum(EnrollmentStatusEnum)
    status!: EnrollmentStatusEnum;
    @IsOptional()
    @IsBoolean()
    @Transform(targ => !targ.value ? true : targ.value)
    newApplicant?: boolean;
    @IsOptional()
    @IsEnum(ExamBody)
    examiningBody?: ExamBody;
}

export class UpdateEnrollmentDTO {
    @IsNotEmpty()
    @IsNumber()
    id!: bigint;
    @IsOptional()
    @IsNumber()
    course?: number;
    @IsOptional()
    @IsNumber()
    yearOfStudy?: number;
    @IsOptional()
    @IsString()
    intake?: string;
    @IsOptional()
    @IsString()
    admissionNumber?: string;
    @IsOptional()
    @IsEnum(StudentTypeEnum)
    studentType?: StudentTypeEnum;
    @IsOptional()
    @IsEnum(EnrollmentStatusEnum)
    status?: EnrollmentStatusEnum;
    @IsOptional()
    @IsBoolean()
    newApplicant?: boolean;
    @IsOptional()
    @IsEnum(ExamBody)
    examiningBody?: ExamBody;
}

export class CoursesResponseDTO {
    id!: number;
    yearOfStudy!: number;
    intake!: number;
    admissionNumber!: string;
    studentType!: StudentTypeEnum;
    status!: EnrollmentStatusEnum;
}
