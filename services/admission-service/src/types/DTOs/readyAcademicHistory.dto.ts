import {IsBoolean, IsEnum, IsNotEmpty, IsString, Matches, ValidateIf} from 'class-validator';
import {BasicEducationEnum, GradeEnum, TertiaryLevel} from "../index";
import {Transform} from "class-transformer";

export class ReadyAcademicHistoryDto {
    @IsString()
    @IsNotEmpty()
    primarySchool!: string;

    @IsString()
    @Matches(/\/\d{4}$/, {
        message: 'KCPE Index number must end with a forward slash and a 4-digit year (e.g., /2024)'
    })
    @IsNotEmpty()
    kcpeIndexNumber!: string;

    @IsEnum(BasicEducationEnum, {message: "Please select a valid highest education level"})
    highestEducationLevel!: BasicEducationEnum | null;

    @ValidateIf(o => o.newApplicant === false, {message: "Admission number is required if applicant is not a new applicant"})
    @IsString({message: "Applicant's admission number is required if applicant is not a new applicant"})
    admissionNumber?: string;

    // --- HIGH_SCHOOL specific fields ---
    @ValidateIf(o => o.basicEducationLevel === BasicEducationEnum.HIGH_SCHOOL,
        {message: "Enter valid high school grade!"})
    @IsEnum(GradeEnum)
    @IsNotEmpty({message: "High school grade is required"})
    kcseGrade!: GradeEnum;

    @ValidateIf(o =>
            // any high school detail is filled
            o.basicEducationLevel === BasicEducationEnum.HIGH_SCHOOL || o.kcseIndexNumber,
        {message: "Enter valid KCSE index number!"})
    @IsString()
    @Matches(/\/\d{4}$/, {
        message: 'KCSE Index number must end with a forward slash and a 4-digit year (e.g., /2024)'
    })
    @IsNotEmpty()
    kcseIndexNumber!: string;

    @ValidateIf(o => o.highSchool || o.basicEducationLevel === BasicEducationEnum.HIGH_SCHOOL,
        {message: "Please specify the high school attended!"})
    @IsString()
    @IsNotEmpty()
    highSchool!: string;

    // Tertiary level
    @ValidateIf(o => o.tertiaryLevel || o.highestEducationLevel === BasicEducationEnum.TERTIARY,
        {message: "Please specify the tertiary certificate attained!"})
    @IsNotEmpty()
    @IsEnum(TertiaryLevel, {message: "Invalid tertiary level"})
    tertiaryLevel!: TertiaryLevel;

    @ValidateIf(o => o.tertiarySchool || o.highestEducationLevel === BasicEducationEnum.TERTIARY,
        {message: "Please specify the tertiary institution!"})
    @IsString()
    @IsNotEmpty()
    tertiarySchool!: string;

}