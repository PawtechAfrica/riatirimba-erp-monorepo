import { ApplicantObj } from '../@types';
import { ApplicantRecords } from '../entities/applicants.entity';

function slapDictObjToObject(
    obj: unknown, // | Record<string, unknown>,
    target: Partial<ApplicantRecords>,
    parentKey: string = '',
) {
    const localCopy = { ...target };
    if (typeof obj !== 'object' || obj === null) return target;
    // remove id to avoid clashing with parent model ID
    if ('id' in obj) delete obj.id;
    for (let key in obj) {
        const value = (obj as unknown as Record<string, unknown>)[key];
        if (typeof value !== 'object' || value === null) {
            // format key
            // special case if key is nextOfKin
            if (parentKey)
                key = parentKey + (key[0]?.toUpperCase() || '') + key.slice(1);
            Object.assign(localCopy, {
                [key]: (value ?? null) as
                    | string
                    | number
                    | boolean
                    | Date
                    | null,
            });
        }
    }
    return localCopy;
}

export default function (applicant: Partial<ApplicantObj>) {
    // let finalData: Record<string, any> = {};
    let finalData: Partial<ApplicantRecords> = {};
    for (const key in applicant) {
        const value = applicant[key];
        // direct assign if it is number or string, number or boolean
        if (typeof value !== 'object' || value instanceof Date) {
            // if it is 'undefined' assign null
            if (!value) finalData[key] = null;
            finalData[key] = value;
            continue;
        }
        if (value === null) {
            finalData[key] = value;
            continue;
        }
        // if value is a dictionary object just append the field flatly
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const val = value[i];
                // most likely will be nextOfKin data
                const parentKey = key.toLowerCase().includes('kin')
                    ? `nok${i + 1}`
                    : '';
                // delete child id object
                if (typeof val === 'object' && val !== null)
                    finalData = {
                        ...slapDictObjToObject(val, finalData, parentKey),
                    };
                else finalData[key] = val;
            }
            continue;
        }
        // handle just normal object
        finalData = { ...slapDictObjToObject(value, finalData) };
    }
    return finalData;
}
