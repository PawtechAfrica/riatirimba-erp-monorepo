import {AxiosError} from "axios";
import {type FileInputValidator, FormError} from "@/libs/types.ts";
import type {NotificationData} from "@mantine/notifications";

export const isValidPhoneFormat = (phone: string) => {
    // Regex for international phone numbers:
    // ^\+: Starts with a plus sign
    // [1-9][0-9]{0,2}: Country code (1-3 digits, not starting with 0)
    // [0-9\s\-()]{6,15}: 6-15 digits, spaces, dashes, or parentheses for the number
    // $: End of string
    const regex = /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/;
    return regex.test(phone);
};

export function makeLabel(input: string): string {
    if (!input) return "";

    // Replace underscores with spaces
    let result = input.replace(/_/g, " ");

    // Add space before capital letters, but not inside all-caps words
    result = result.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Trim extra spaces
    result = result.trim();

    // Split into words
    const words = result.split(/\s+/);

    // Process each word: keep acronyms as-is, format normal words
    const formatted = words.map((word) => {
        if (word === word.toUpperCase() && word.length > 1) {
            // All caps (acronym) → leave unchanged
            return word;
        }
        // Normal word → capitalize first letter, lowercase the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formatted.join(" ");
}

export const getEnumKey = <T extends object>(enumObj: T, value: string) =>
    Object.keys(enumObj).find((k) => enumObj[k as keyof T] === value);

export function getErr(error: Error | AxiosError): NotificationData {
    if (error instanceof FormError) {
        return {title: "Input error!", message: error.serverMessage, color: "orange"};
    }
    if (error instanceof AxiosError) {
        const message: string = error.response?.data.error ?? error.response?.statusText ?? "Something went wrong";
        return {title: "Notification!", message: message, color: "red"};
    }

    return {title: "Error occurred!!", message: "Something went wrong!", color: "red"};
}

export function isValidIndexNumber(entry: string): boolean {
    // Regex:
    // ^\d{11}: Exactly 11 digits at the start
    // \/: A literal forward slash
    // \d{4}: Exactly 4 digits
    // $: End of string
    const regex = /^\d{11}\/\d{4}$/;
    return regex.test(entry);
}

/**
 * Validates that an image file has the specified dimensions.
 * @returns Promise<boolean> - true if matches, false otherwise
 * @param width
 * @param height
 */
export const DimensionValidator =
    (width: number, height: number) =>
        async (file: File | null): Promise<boolean> => {
            if (!file) return false;

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width === width && img.height === height) {
                        resolve(true);
                    } else {
                        reject(
                            new Error(
                                `Invalid image dimensions: expected ${width}×${height}, got ${img.width}×${img.height}`,
                            ),
                        );
                    }
                };
                img.onerror = () => reject(new Error("Failed to load image file."));
                img.src = URL.createObjectURL(file);
            });
        };

export async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export const getYearOfStudyList = (course: CourseObj) => {
    // 2 modules a year
    const years = Math.ceil(course.duration / 2)
    return Array.from(Array(years).keys()).map(year => year + 1)
}

export const validateIndexNumber = (indexNo: any): [boolean, string] => {
    if (typeof indexNo !== 'string' && typeof indexNo !== 'number') return [false, "Index number must be a string"];
    const isValid = /\/\d{4}$/.test(indexNo.toString())
    return isValid
        ? [true, '']
        : [isValid, "Index number must end with the year you sat the exam!"]
}


export const FileSizeValidator =
    (maxMb: number, minMb = 0): FileInputValidator =>
        async (file: File | null) => {
            if (!file) return false; // No file → reject validation

            const sizeInMb = file.size / (1024 * 1024); // Convert bytes → MB

            if (sizeInMb > maxMb) {
                throw new Error(`File size exceeds ${maxMb}MB`);
            }

            if (sizeInMb < minMb) {
                throw new Error(`File size is below ${minMb}MB`);
            }

            return true;
        };

export const AspectRatioValidator =
    (expectedRatio: number, minWidth = 0, minHeight = 0): FileInputValidator =>
        (file: File | null) => {
            return new Promise((resolve, reject) => {
                if (!file) return resolve(false);

                const img = new Image();
                img.onload = () => {
                    const actualRatio = img.width / img.height;

                    if (img.width < minWidth || img.height < minHeight) {
                        return reject(new Error(`Image dimensions too small: at least ${minWidth}×${minHeight} required.`));
                    }

                    if (Math.abs(actualRatio - expectedRatio) > 0.01) {
                        return reject(new Error(`Image does not match ${expectedRatio}:1 aspect ratio.`));
                    }

                    resolve(true);
                };

                img.onerror = () => reject(new Error("Could not load image."));
                img.src = URL.createObjectURL(file);
            });
        };

export function splitPhone(number: string) {
    const cleaned = number.replace(/[\s-]/g, ''); // remove spaces/dashes

    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
    if (!match) return null;

    return {
        countryCode: `+${match[1]}`,
        phoneNumber: match[2]
    };
}
