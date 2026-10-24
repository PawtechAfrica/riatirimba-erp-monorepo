import type {ApplicantsRecordKeys} from "@/libs/types/app.types.ts";
import type {NextOfKinObj} from "@/libs/types/admission.types.ts";

export const defaultNextOfKin: NextOfKinObj = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    relationship: ""
}


export const APPLICANT_RECORD_KEYS: ApplicantsRecordKeys[] = [
    'id',
    // Base Info
    'firstName', 'middleName', 'lastName', 'email', 'phone',
    'birthCertNumber', 'idNumber', 'gender', 'pinNumber',
    // Address
    'zipCode', 'poBox', 'county', 'location', 'subLocation', 'village',
    // Academic
    'highestEducationLevel', 'kcseIndexNumber', 'kcpeIndexNumber',
    'primarySchool', 'highSchool', 'tertiaryLevel', 'tertiarySchool', 'kcseGrade',
    // Enrollment
    'course', 'newApplicant', 'intake', 'dateOfBirth', 'admissionNumber',
    'yearOfStudy', 'examiningBody', 'studentType',
    // NOK 1
    'nok1FirstName', 'nok1LastName', 'nok1Phone', 'nok1Email', 'nok1Relationship',
    // NOK 2
    'nok2FirstName', 'nok2LastName', 'nok2Phone', 'nok2Email', 'nok2Relationship',
    // Status
    'submitted', 'completionStatus', 'migrated', 'pending', 'createdAt', 'updatedAt'
];