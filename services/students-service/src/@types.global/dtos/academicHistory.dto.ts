import {IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf} from "class-validator";
import {EducationLevelEnum, GradeEnum, TertiaryLevel} from "../../database/@types.database";
import {Transform} from "class-transformer";
import {indexNumberRegex} from "../../utils/regex";

export class CreateAcademicHistoryDto {
    @IsNotEmpty()
    @IsEnum(EducationLevelEnum, {message: "Invalid basic education level"})
    highestEducationLevel?: EducationLevelEnum | null;

    @IsNotEmpty()
    @IsString({message: "KCPE index number must be a string"})
    @Matches(indexNumberRegex, {message: "KCPE index number must be in format index/year E.g. 12345678901/2020"})
    kcpeIndexNumber?: string;

    @IsNotEmpty()
    @IsString({message: "Primary school must be a string"})
    primarySchool!: string;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.HIGH_SCHOOL)
    @IsNotEmpty()
    @IsString({message: "KCSE index number must be a string"})
    @Transform((tar) => (tar.value ? tar.value : undefined))
    @Matches(/^\d{11}\/\d{4}$/, {message: "KCSE index number must be in format index/year E.g. 12345678901/2020"})
    kcseIndexNumber?: string;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.HIGH_SCHOOL)
    @IsNotEmpty()
    @IsString({message: "High school must be a string"})
    highSchool?: string;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.HIGH_SCHOOL)
    @IsNotEmpty()
    @IsEnum(GradeEnum, {message: "Invalid KCSE grade"})
    kcseGrade?: GradeEnum;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.TERTIARY)
    @IsNotEmpty()
    @IsString()
    tertiarySchool?: GradeEnum;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.TERTIARY)
    @IsNotEmpty()
    @IsEnum(TertiaryLevel, {message: "Invalid tertiary level"})
    tertiaryLevel?: TertiaryLevel;

}

export class UpdateAcademicHistoryDto {

    @IsOptional()
    @IsEnum(EducationLevelEnum, {message: "Invalid basic education level"})
    highestEducationLevel?: EducationLevelEnum | null;

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
    @IsEnum(GradeEnum, {message: "Invalid KCSE grade"})
    kcseGrade?: GradeEnum;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.TERTIARY)
    @IsNotEmpty()
    @IsString()
    tertiarySchool?: GradeEnum;

    @ValidateIf((obj) => obj.highestEducationLevel === EducationLevelEnum.TERTIARY)
    @IsNotEmpty()
    @IsEnum(TertiaryLevel, {message: "Invalid tertiary level"})
    tertiaryLevel?: TertiaryLevel;
}

export class AcademicHistoryResponseDto {
    id!: number;
    highestEducationLevel!: EducationLevelEnum | null;
    kcpeIndexNumber!: string;
    primarySchool!: string;
    kcseIndexNumber?: string;
    highSchool?: string;
    kcseGrade?: GradeEnum;
}
