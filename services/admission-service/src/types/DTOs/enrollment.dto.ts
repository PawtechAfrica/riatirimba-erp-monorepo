import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {ExamBodyEnum, StudentTypeEnum} from "../index";
import {Expose, Transform} from "class-transformer";


export class CreateEnrollmentDTO {

    @IsOptional()
    @Transform(targ => targ.value ? targ.value : undefined)
    @IsNumber()
    course?: number;

    @IsOptional()
    @IsString()
    intake?: string;

    @IsOptional()
    @IsBoolean()
    newApplicant?: boolean;

    @IsOptional()
    @IsString()
    admissionNumber?: string;

    @IsOptional()
    @IsEnum(StudentTypeEnum)
    studentType?: StudentTypeEnum;

    @IsOptional()
    @IsNumber()
    yearOfStudy?: number;

    @IsOptional()
    @IsEnum(ExamBodyEnum)
    examiningBody?: ExamBodyEnum;
}

export class UpdateEnrollmentDTO extends CreateEnrollmentDTO {
    @IsNotEmpty()
    @IsNumber()
    id!: number;
}

export class EnrollmentResponseDTO extends UpdateEnrollmentDTO {
    @Expose()
    createdAt!: Date;
}

