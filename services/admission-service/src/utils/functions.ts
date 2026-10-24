import {AppError} from "./bootstrappers";
import sharp from "sharp";
import * as console from "node:console";
import * as fs from "fs/promises";
import {Server} from "node:http";
import {MikroORM} from "@mikro-orm/postgresql";
import dayjs from "dayjs";
import {killCrons, runCrons} from "../crons/cron-runner";

// export const isValidPhoneFormat = (phone: string) => {
//     // Regex for international phone numbers:
//     // ^\+: Starts with a plus sign
//     // [1-9][0-9]{0,2}: Country code (1-3 digits, not starting with 0)
//     // [0-9\s\-()]{6,15}: 6-15 digits, spaces, dashes, or parentheses for the number
//     // $: End of string
//     const regex = /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/;
//     return regex.test(phone);
// }

// export function isValidIndexNumber(entry: string): boolean {
//     // Regex:
//     // ^\d{11}: Exactly 11 digits at the start
//     // \/: A literal forward slash
//     // \d{4}: Exactly 4 digits
//     // $: End of string
//     const regex = /^\d{11}\/\d{4}$/;
//     return regex.test(entry);
// }

export function makeLabel(input: string): string {
    // Handle snake_case by replacing underscores with spaces
    let result = input.replace(/_/g, ' ');

    // Handle camelCase by adding space before uppercase letters
    result = result.replace(/([A-Z])/g, ' $1');

    // Remove the leading space if any
    result = result.trim();

    // Capitalize the first letter, lowercase the rest
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}

export async function isValidImage(file: Express.Multer.File) {
    try {
        const buffer = await fs.readFile(file.path)
        return await sharp(buffer).metadata()
    } catch (err) {
        console.log("Image error: ", err)
        throw new AppError(`Please use a valid image for ${makeLabel(file.fieldname)}!`, 400);
    }
}

/*
@description - Validates the file type of the uploaded file.
 */
export async function validateFileType(file: Express.Multer.File, type: 'pdf' | 'xlsx') {
    try {

    } catch (err) {
        throw new AppError(`File is not of type ${type}`)
    }
}

export function gracefulShutdown(server: Server, orm: MikroORM) {
    console.log("\n")
    server.close(async (err) => {
        if (err) {
            console.log("Error closing server:\n", err)
        } else {
            await killCrons()
                .then(() => console.log("Crons Successfully Stopped ✂..."))
            await orm.close(true)
                .then(() => {
                    console.log("Database Connection Closed ✂...")
                })
                .catch(err => {
                    console.log("Error closing db connection:\n", err)
                })// close db connection
            console.log("---GOODBYE👋 SERVER CLOSED---")
            process.exit(0)
        }
    })
}

export function getExcelType(value: any) {
    if (typeof value === 'string') {
        return String;
    } else if (typeof value === 'number') {
        return Number;
    } else if (typeof value === 'boolean') {
        return Boolean;
    } else if (dayjs(value).isValid()) {
        return Date;
    } else {
        return String;
    }
}
