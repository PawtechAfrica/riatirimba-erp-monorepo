import {NextOfKinObj} from "../index";
import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";


export class ReadyNextOfKinDto implements NextOfKinObj {
    @IsNotEmpty({message: "Next of kin's first name is required!"})
    @IsString()
    firstName!: string;
    @IsNotEmpty({message: "Next of kin's last name is required!"})
    @IsString()
    lastName!: string;
    @IsNotEmpty({message: "Next of kin's phone number is required!"})
    @IsString()
    phone!: string;
    @IsNotEmpty({message: "Please specify relationship with applicant"})
    @IsString()
    relationship!: string;
    @IsOptional()
    @IsEmail(undefined, {message: "Invalid email format"})
    email?: string;
}