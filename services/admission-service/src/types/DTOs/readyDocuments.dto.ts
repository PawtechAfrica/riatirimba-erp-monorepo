import {IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";


export class ReadyDocumentsDto {
    @IsNotEmpty({message: "Please upload birth certificate!"})
    @IsString()
    birthCertificate!: string;
    @IsNotEmpty({message: "Please upload passport photo!"})
    @IsString()
    passportPhoto!: string;
    @IsNotEmpty({message: "Please upload kcpe certificate!"})
    @IsString()
    kcpeCertificate!: string;

    @IsOptional()
    @Transform(targ => targ.value ? targ.value : undefined)
    @IsString()
    kcseCertificate?: string;

    @IsOptional()
    @Transform(targ => targ.value ? targ.value : undefined)
    @IsString()
    nationalId?: string;

    @IsOptional()
    @Transform(targ => targ.value ? targ.value : undefined)
    @IsString()
    tertiaryCertificate?: string;

}

