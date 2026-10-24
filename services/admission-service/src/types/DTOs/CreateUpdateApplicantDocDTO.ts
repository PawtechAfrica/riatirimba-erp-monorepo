import {IsOptional, IsString, ValidateIf} from "class-validator";


export class CreateUpdateApplicantDocDTO {
    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    passportPhoto?: string | null;

    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    identification?: string | null;

    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    birthCertificate?: string | null;

    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    kcpeCertificate?: string | null;

    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    kcseCertificate?: string | null;

    @IsOptional()
    @ValidateIf((_, val) => typeof val === "string" || val !== null)
    @IsString()
    tertiaryCertificate?: string | null;
}

