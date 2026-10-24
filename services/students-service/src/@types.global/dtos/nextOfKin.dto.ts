import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";

export class CreateNextOfKinDTO {
    @MaxLength(100, { message: "First name cannot exceed 100 characters" })
    @IsString({ message: "First name must be a string" })
    @IsNotEmpty({ message: "First name is required" })
    firstName!: string;

    @MaxLength(100, { message: "Last name cannot exceed 100 characters" })
    @IsString({ message: "Last name must be a string" })
    @IsNotEmpty({ message: "Last name is required" })
    lastName!: string;

    @IsEmail({}, { message: "Invalid email format" })
    @IsOptional()
    email?: string;

    @MaxLength(20, { message: "Phone number cannot exceed 20 characters" })
    // @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
    @IsNotEmpty({ message: "Phone number is required" })
    phone!: string;

    @MaxLength(50, { message: "Relationship cannot exceed 50 characters" })
    @IsString({ message: "Relationship must be a string" })
    @IsNotEmpty({ message: "Relationship is required" })
    relationship!: string;
}

export class UpdateNextOfKinDTO {
    @IsNotEmpty()
    id!: string;

    @MaxLength(100, { message: "First name cannot exceed 100 characters" })
    @IsString({ message: "First name must be a string" })
    @IsOptional()
    firstName?: string;

    @MaxLength(100, { message: "Last name cannot exceed 100 characters" })
    @IsString({ message: "Last name must be a string" })
    @IsOptional()
    lastName?: string;

    @IsEmail({}, { message: "Invalid email format" })
    @IsOptional()
    email?: string;

    @MaxLength(20, { message: "Phone number cannot exceed 20 characters" })
    // @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
    @IsOptional()
    phone?: string;

    @MaxLength(50, { message: "Relationship cannot exceed 50 characters" })
    @IsString({ message: "Relationship must be a string" })
    @IsOptional()
    relationship?: string;
}

export class NextOfKinResponseDTO {
    id!: string;
    firstName!: string;
    lastName!: string;
    email?: string;
    phone!: string;
    relationship!: string;

    constructor(nextOfKin: any) {
        this.id = nextOfKin.id;
        this.firstName = nextOfKin.firstName;
        this.lastName = nextOfKin.lastName;
        this.email = nextOfKin.email;
        this.phone = nextOfKin.phone;
        this.relationship = nextOfKin.relationship;
    }
}
