import {IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf} from "class-validator";
import {Transform} from "class-transformer";
import {BasicEducationEnum, GradeEnum, TertiaryLevel} from "../index";

export class CreateAcademicHistoryDTO {
    @IsNotEmpty({message: "Highest education level is required"})
    @IsEnum(BasicEducationEnum, {message: "Invalid basic education level"})
    highestEducationLevel?: BasicEducationEnum | null;

    @IsNotEmpty()
    @ValidateIf((obj) => obj.highestEducationLevel === BasicEducationEnum.PRIMARY_SCHOOL && !obj.kcseIndexNumber)
    @IsString({message: "KCPE index number must be a string"})
    @Matches(/^(?:\d{11}|\d{9})\/\d{4}$/, {message: "KCPE index number must be in format index/year E.g. 12345678901/2020"})
    kcpeIndexNumber!: string;

    @IsOptional()
    @IsString({message: "Primary school must be a string"})
    primarySchool!: string;

    @IsOptional()
    @ValidateIf((obj) => obj.highestEducationLevel === BasicEducationEnum.HIGH_SCHOOL && !obj.kcpeIndexNumber)
    @IsString({message: "KCSE index number must be a string"})
    @Transform((tar) => (tar.value ? tar.value : undefined))
    @Matches(/^\d{11}\/\d{4}$/, {message: "KCSE index number must be in format index/year E.g. 12345678901/2020"})
    kcseIndexNumber?: string;

    @ValidateIf((obj) => obj.highestEducationLevel === BasicEducationEnum.HIGH_SCHOOL)
    @IsOptional()
    @IsString({message: "High school must be a string"})
    highSchool?: string;

    @ValidateIf((obj) => obj.highestEducationLevel === BasicEducationEnum.TERTIARY)
    @IsOptional()
    @IsString({message: "Tertiary institution must be a string"})
    tertiarySchool?: string;

    @IsOptional()
    @IsEnum(TertiaryLevel)
    tertiaryLevel?: TertiaryLevel | null;

    @ValidateIf((obj) => obj.highestEducationLevel === BasicEducationEnum.HIGH_SCHOOL)
    @IsOptional()
    @IsEnum(GradeEnum, {message: "Invalid KCSE grade"})
    kcseGrade?: GradeEnum;
}

export class UpdateAcademicHistoryDTO {
    @IsNotEmpty()
    id!: number;

    @IsOptional()
    @IsEnum(BasicEducationEnum, {message: "Invalid basic education level"})
    highestEducationLevel?: BasicEducationEnum | null;

    @IsOptional()
    @IsString({message: "KCSE index number must be a string"})
        // @Matches(/^\d{11}\/\d{4}$/, {message: 'KCSE index number must be in format 12345678901/2020'})
    kcseIndexNumber?: string;

    @IsOptional()
    @IsString({message: "KCPE index number must be a string"})
        // @Matches(/^\d{11}\/\d{4}$/, {message: 'KCPE index number must be in format 12345678901/2020'})
    kcpeIndexNumber?: string;

    @IsOptional()
    @IsString({message: "Primary school must be a string"})
    primarySchool?: string;

    @IsOptional()
    @IsString({message: "High school must be a string"})
    highSchool?: string;

    @IsOptional()
    @IsString({message: "Tertiary institution must be a string"})
    tertiarySchool?: string;

    @IsOptional()
    @IsEnum(TertiaryLevel)
    tertiaryLevel?: TertiaryLevel | null;

    @IsOptional()
    @IsEnum(GradeEnum, {message: "Invalid KCSE grade"})
    kcseGrade?: GradeEnum;
}

export class AcademicHistoryResponseDTO {
    id!: number;
    highestEducationLevel!: BasicEducationEnum | null;
    kcpeIndexNumber!: string;
    primarySchool!: string;
    kcseIndexNumber?: string;
    highSchool?: string;
    kcseGrade?: GradeEnum;
    tertiarySchool?: string;
    tertiaryLevel?: BasicEducationEnum | null;
}
