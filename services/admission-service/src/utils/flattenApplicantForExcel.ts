import { Applicants } from "../database/entities/Applicants.entity";
import { Collection } from "@mikro-orm/core";
import dayjs from "dayjs";
import { COLUMN_CONFIG, FlatApplicantExport } from "./config_constants";

export function standardizeApplicantsForExcel(applicants: Applicants[]): FlatApplicantExport[] {
    return applicants.map(app => processSingleApplicant(app));
}

/**
 * Internal helper to flatten entity to a loose dictionary.
 * This extracts all data into a single level object before we filter/order it.
 */
function flattenToRaw(app: Applicants): Record<string, any> {
    // 1. Flatten the base applicant properties
    const raw: Record<string, any> = {
        ...app,
        // Explicitly grab getters (spread operator ...app doesn't catch them)
        age: app.age,
        dateOfBirth: app.dateOfBirth,
        // Format root dates
        createdAt: formatDate(app.createdAt),
        updatedAt: formatDate(app.updatedAt),
    };

    // 2. Helper to flatten sub-objects with a prefix (e.g., 'addr_')
    const flattenRelation = (data: any, prefix: string) => {
        if (!data) return;

        // data might be a MikroORM entity or a POJO.
        // We use Object.entries to iterate over its properties.
        Object.entries(data).forEach(([k, v]) => {
            // Exclude internal keys, IDs (if desired), and back-references
            if (k === 'id' || k === 'applicant' || k.startsWith('_')) return;

            // Handle date formatting for child properties
            raw[`${prefix}_${k}`] = (v instanceof Date) ? formatDate(v) : v;
        });
    };

    // 3. Process Relations
    if (app.address) flattenRelation(app.address, 'addr');

    if (app.academicHistory) flattenRelation(app.academicHistory, 'edu');

    if (app.enrollments) {
        flattenRelation(app.enrollments, 'enrol');

        // Special Handling for nested Intake relation inside Enrollment
        if (app.enrollments.intake) {
            // Check if intake is loaded (object) or just an ID
            const intakeVal = app.enrollments.intake;
            // @ts-ignore - Assuming intake has an 'id' property if it's an object
            raw['enrol_intake'] = typeof intakeVal === 'object' && intakeVal !== null
                ? (intakeVal as any).id
                : intakeVal;
        }
    }

    // 4. Process Next of Kin (Limit 2)
    if (app.nextOfKins) {
        // Handle MikroORM Collection wrapper vs standard array
        const kins = app.nextOfKins instanceof Collection
            ? app.nextOfKins.getItems()
            : app.nextOfKins;

        // Flatten first NOK
        if (kins[0]) flattenRelation(kins[0], 'nok1');
        // Flatten second NOK
        if (kins[1]) flattenRelation(kins[1], 'nok2');
    }

    return raw;
}

/**
 * Simple Date formatter helper
 */
function formatDate(date: any): string | null {
    if (!date) return null;
    const d = dayjs(date);
    return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function processSingleApplicant(app: Applicants): FlatApplicantExport {
    const raw = flattenToRaw(app);
    const ordered: any = {};

    // Iterate through our CONFIG to build the object in the exact order
    for (const col of COLUMN_CONFIG) {
        ordered[col.key] = raw[col.key] !== undefined && raw[col.key] !== "" ? raw[col.key] : null;
    }

    return ordered as FlatApplicantExport;
}

// ... include the same flattenToRaw helper from the previous response ...
// (Let me know if you need me to paste that helper again)