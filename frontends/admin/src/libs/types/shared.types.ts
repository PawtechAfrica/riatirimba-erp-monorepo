import {GenderEnum} from "@/libs/types/admission.types.ts";

export interface BaseQueryFilter {
    [key: string]: string | number | boolean | null | undefined | number[];
    page: number;
    gender?: GenderEnum | null; // or the specific union type if GenderEnum is an array
    course?: number[];
    department?: number[];
}