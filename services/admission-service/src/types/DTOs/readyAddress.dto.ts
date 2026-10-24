import {IsOptional, IsString} from "class-validator";

export class ReadyAddressDto {
    @IsOptional()
    @IsString()
    county?: string;
    @IsOptional()
    @IsString()
    location?: string;
    @IsOptional()
    @IsString()
    subLocation?: string;
    @IsOptional()
    @IsString()
    village?: string;
}