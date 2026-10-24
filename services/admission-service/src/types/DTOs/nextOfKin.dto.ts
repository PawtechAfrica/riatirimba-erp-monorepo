import {IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";
import {Transform} from "class-transformer";

export class CreateNextOfKinDTO {
    @IsNotEmpty({message: "First name is required"})
    @IsString({message: "First name must be a string"})
    @MaxLength(100, {message: "First name cannot exceed 100 characters"})
    firstName!: string;

    @IsNotEmpty({message: "Last name is required"})
    @IsString({message: "Last name must be a string"})
    @MaxLength(100, {message: "Last name cannot exceed 100 characters"})
    lastName!: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsNotEmpty({message: "Phone number is required"})
    // @IsPhoneNumber(undefined, {message: "Invalid phone number format"})
    @MaxLength(20, {message: "Phone number cannot exceed 20 characters"})
    phone!: string;

    @IsNotEmpty({message: "Relationship is required"})
    @IsString({message: "Relationship must be a string"})
    @MaxLength(50, {message: "Relationship cannot exceed 50 characters"})
    relationship!: string;
    @IsOptional()
    @IsString({message: "Something went wrong!"})
    applicant?: string
}

export class UpdateNextOfKinDTO {
    @IsOptional()
    id?: bigint;

    @IsOptional()
    @IsString({message: "First name must be a string"})
    @MaxLength(100, {message: "First name cannot exceed 100 characters"})
    @Transform(targ => targ.value ? targ.value : undefined)
    firstName?: string;

    @IsOptional()
    @IsString({message: "Last name must be a string"})
    @MaxLength(100, {message: "Last name cannot exceed 100 characters"})
    @Transform(targ => targ.value ? targ.value : undefined)
    lastName?: string;

    @IsOptional()
    @Transform(targ => targ.value ? targ.value : undefined)
    @IsEmail()
    email?: string;

    @IsOptional()
    // @IsPhoneNumber(undefined, {message: "Invalid phone number format"})
    @Transform(targ => targ.value ? targ.value : undefined)
    @MaxLength(20, {message: "Phone number cannot exceed 20 characters"})
    phone?: string;

    @IsOptional()
    @IsString({message: "Relationship must be a string"})
    @MaxLength(50, {message: "Relationship cannot exceed 50 characters"})
    @Transform(targ => targ.value ? targ.value : undefined)
    relationship?: string;

    @IsOptional()
    @IsString({message: "Something went wrong!"})
    applicant?: string
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
