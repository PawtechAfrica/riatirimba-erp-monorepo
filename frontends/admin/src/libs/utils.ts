import {type AxiosResponse} from "axios";
import dayjs from "dayjs";
import type {LinkGroupObj} from "@/libs/types/admission.types.ts";
import {notifications} from "@mantine/notifications";
import {showErr} from "@/utils/notification.util.tsx";


export function routeIsActive(current: LinkGroupObj, pathname: string, isActive: boolean) {
    if (current.params) {
        // contains params so we'll do some gymnastics
        const firstKey = Object.keys(current.params)[0]
        // replace it in pathname
        let holdPath = current.path.replaceAll(`$${firstKey}`, "")
        return pathname.includes(holdPath)
    }
    return isActive
    // console.log(current.path, pathname)
}

export function getCurrentTermNumber() {
    // 1: Jan - April
    // 2: May - August
    // 3: September - December
    const currentMonth = dayjs().month() + 1;
    if (currentMonth >= 1 && currentMonth <= 4) return 1;
    if (currentMonth >= 5 && currentMonth <= 8) return 2;
    return 3;
}

export function makeLabel(input: any): string {
    if (!input || typeof input !== 'string') return "";

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
        return word.charAt(0)?.toUpperCase() + word.slice(1)?.toLowerCase();
    });

    return formatted.join(" ");
}


export const isValidPhoneFormat = (phone: any) => {
    // Regex for international phone numbers:
    // ^\+: Starts with a plus sign
    // [1-9][0-9]{0,2}: Country code (1-3 digits, not starting with 0)
    // [0-9\s\-()]{6,15}: 6-15 digits, spaces, dashes, or parentheses for the number
    // $: End of string
    if (typeof phone !== 'string') return false;
    const regex = /^\+[1-9][0-9]{0,2}[0-9\s\-()]{6,15}$/;
    return regex.test(phone);
}

// todo: test this function
export const compareObjByValue = (initial: object, target: object): boolean => {
    // ensure both are objects
    if (typeof initial !== 'object' || typeof target !== 'object') return false
    // ensure both or none is null
    if ((initial !== null && target === null) || (target !== null && initial === null)) return false;
    // should have the same number of keys
    if (Object.keys(target).length !== Object.keys(initial).length) return false;
    // iterate through each key and compare values and keys
    for (const key in initial) {
        // key in initial is absent in target
        if (!target.hasOwnProperty(key)) return false;
        // values are different after coalescing
        const valueInInitial = initial[key as keyof typeof initial];
        const valueInTarget = target[key as keyof typeof target];
        // compare by coalesced values if possible
        if (valueInInitial == valueInTarget) continue // skip this cycle
        // Check if they are the same type
        if (typeof valueInTarget !== typeof valueInInitial) return false;
        if (valueInInitial == null && valueInTarget === null) return false;
        // check if they are objects and recurse, at this point they are of the same type
        if (valueInInitial && valueInTarget && typeof valueInInitial === 'object' && typeof valueInTarget === 'object')
            return compareObjByValue(valueInInitial, valueInTarget)
    }
    return true;
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
}

export function getFilenameFromResponse(response: AxiosResponse): string {
    const disposition = response.headers["content-disposition"];

    if (!disposition) {
        return `report-${dayjs().format("hh:mm:ss DD-MMM-YYYY")}.xlsx`;
    }

// 1. Uses a more robust regex:
// filename="? -> optional opening quote
// ([^";]+)-> captures everything EXCEPT a quote or semicolon (the filename)
// "?         -> optional closing quote
    const match = disposition.match(/filename="?([^";]+)"?/);

// 2. Safely return the match or a fallback
    return match && match[1] ? match[1].trim() : "report.xlsx";
}

export function timeDifference(date: string | Date, from: Date = new Date(), units: 'minutes' | 'seconds' = 'minutes') {
    if (!dayjs(date).isValid()) throw new Error("Function received invalid date")
    return dayjs(from).diff(date, units)
}

/**
 * @description Course duration is stored as number of modules. Each module is 3 months long. The number of years is therefore 2 modules every registry year
 * @param modules
 */
export function getCourseYearsOfStudies(modules: number) {
    const years = Math.ceil(modules / 2)
    return Array.from(Array(years).keys()).map(key => key + 1)
}

export function hasPermissions(
    userPermissions: string[],
    required?: string | string[]
): boolean {
    if (!required) return true;

    if (Array.isArray(required)) {
        return required.every(permission =>
            userPermissions.includes(permission)
        );
    }

    return userPermissions.includes(required);
}

export function printDialogue(blob: Blob) {
    try {
        const url = URL.createObjectURL(blob);

        // Open in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (!printWindow) return notifications.show(showErr(new Error("Unable to open window")))
        printWindow.onload = function () {
            printWindow.print();
        };

        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
        notifications.show(showErr(err as Error))
    }
}

