import {IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {IntakePeriodEnum} from "../index";
import {Transform} from "class-transformer";
import {IntakeStatus} from "../../database/entities/Intake.entity";

export class CreateIntakeDTO {
    @IsNotEmpty()
    @IsEnum(IntakePeriodEnum)
    period!: IntakePeriodEnum;

    @IsNotEmpty()
    @IsNumber()
    year!: number;

    @IsOptional()
    @IsDateString()
    @Transform(targ => targ.value ? targ.value?.toString() : undefined)
    opens?: string | Date;

    @IsOptional()
    @IsDateString()
    @Transform(targ => targ.value ? targ.value.toString() : undefined)
    closes?: string | Date;
}

export class UpdateIntakeDTO extends CreateIntakeDTO {
    @IsOptional()
    @IsBoolean()
    closed?: boolean;
}

export class IntakeResponseDTO extends UpdateIntakeDTO {
    @IsNotEmpty()
    id!: number;
    @IsNotEmpty()
    readable!: string;
    @IsNotEmpty()
    periodYearKey!: string;
    @IsEnum(IntakeStatus)
    status!: IntakeStatus;
}


