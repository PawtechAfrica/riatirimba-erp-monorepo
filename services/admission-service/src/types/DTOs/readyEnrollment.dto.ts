import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf} from "class-validator";
import {Transform} from "class-transformer";
import {ExamBodyEnum, IntakeObj, StudentTypeEnum} from "../index";


export class ReadyEnrollmentDto {
    @IsString({message: "Please pick a valid course!"})
    @IsNotEmpty({message: "Please pick a valid course!"})
    course!: string;

    @IsString({message: "Pick a valid intake!"})
    @IsNotEmpty({message: "Please pick a valid intake!"})
    @Transform(targ => {
        if (typeof targ.value === 'string') return targ.value
        return (targ.value as IntakeObj)?.periodYearKey
    })
    intake!: string;

    @IsNotEmpty({message: "Please specify if applicant is a new applicant!"})
    @IsBoolean()
    newApplicant!: boolean;

    @IsString()
    @IsNotEmpty({message: "Please specify applicant's admission number!"})
    @ValidateIf(o => o.newApplicant == false)
    admissionNumber!: string;

    @ValidateIf(o => !o.newApplicant)
    @IsNotEmpty({message: "Please specify applicant's year of study!"})
    @IsNumber()
    yearOfStudy!: number;

    @IsNotEmpty({message: "Please specify applicant's examining body!"})
    @IsEnum(ExamBodyEnum)
    examiningBody!: ExamBodyEnum;

    @IsNotEmpty({message: "Please specify applicant's applicant's sponsorship type!"})
    @IsEnum(StudentTypeEnum)
    studentType!: StudentTypeEnum;
}

