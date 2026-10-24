import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAddressDto {
    @IsNotEmpty()
    @IsNumber({}, { message: "PO Box must be a number" })
    poBox?: number | null;

    @IsNotEmpty()
    @IsNumber({}, { message: "Zip code must be a number" })
    zipCode?: number | null;

    @IsNotEmpty()
    @IsString({ message: "County must be a string" })
    county?: string | null;

    @IsNotEmpty()
    @IsString({ message: "Location must be a string" })
    location?: string | null;

    @IsNotEmpty()
    @IsString({ message: "Sub-location must be a string" })
    subLocation?: string | null;

    @IsNotEmpty()
    @IsString({ message: "Village must be a string" })
    village?: string | null;
}

export class UpdateAddressDto {
    @IsOptional()
    id?: number;

    @IsOptional()
    @IsNumber({}, { message: "PO Box must be a number" })
    poBox?: number | null;

    @IsOptional()
    @IsNumber({}, { message: "Zip code must be a number" })
    zipCode?: number | null;

    @IsOptional()
    @IsString({ message: "County must be a string" })
    county?: string | null;

    @IsOptional()
    @IsString({ message: "Location must be a string" })
    location?: string | null;

    @IsOptional()
    @IsString({ message: "Sub-location must be a string" })
    subLocation?: string | null;

    @IsOptional()
    @IsString({ message: "Village must be a string" })
    village?: string | null;
}

export class AddressResponseDto {
    id!: number;
    poBox?: number | null;
    zipCode?: number | null;
    county?: string | null;
    location?: string | null;
    subLocation?: string | null;
    village?: string | null;

    constructor(address: any) {
        this.id = address.id;
        this.poBox = address.poBox;
        this.zipCode = address.zipCode;
        this.county = address.county;
        this.location = address.location;
        this.subLocation = address.subLocation;
        this.village = address.village;
    }
}
