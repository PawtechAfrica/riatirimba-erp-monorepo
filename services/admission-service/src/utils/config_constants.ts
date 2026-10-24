export const APPLICANT_FETCH_SIZE = 100

// config/excel-columns.ts

// config/excel-columns.ts

export const COLUMN_CONFIG = [
    // --- Identity ---
    {key: "firstName", label: "First Name"},
    {key: "middleName", label: "Middle Name"},
    {key: "lastName", label: "Last Name"},
    {key: "gender", label: "Gender"},
    {key: "dateOfBirth", label: "Date of Birth"},
    {key: "age", label: "Age"},
    {key: "idType", label: "ID Type"},
    {key: "idNumber", label: "ID Number"},
    {key: "pinNumber", label: "KRA PIN"},

    // --- Contact ---
    {key: "email", label: "Email Address"},
    {key: "phone", label: "Phone Number"},

    // --- Address ---
    {key: "addr_county", label: "County"},
    {key: "addr_location", label: "Location"},
    {key: "addr_subLocation", label: "Sub-Location"},
    {key: "addr_village", label: "Village"},
    {key: "addr_poBox", label: "P.O. Box"},
    {key: "addr_zipCode", label: "Postal Code"},

    // --- Education ---
    {key: "edu_highestEducationLevel", label: "Highest Education"},
    {key: "edu_kcseGrade", label: "KCSE Grade"},
    {key: "edu_kcseIndexNumber", label: "KCSE Index No."},
    {key: "edu_kcpeIndexNumber", label: "KCPE Index No."},
    {key: "edu_primarySchool", label: "Primary School"},
    {key: "edu_highSchool", label: "High School"},
    {key: "edu_tertiaryLevel", label: "Tertiary Level"},
    {key: "edu_tertiarySchool", label: "Tertiary Institution"},

    // --- Enrollment ---
    {key: "enrol_admissionNumber", label: "Admission No."},
    {key: "enrol_course", label: "Course ID"},
    {key: "enrol_intake", label: "Intake"},
    {key: "enrol_studentType", label: "Student Type"},
    {key: "enrol_yearOfStudy", label: "Year of Study"},
    {key: "enrol_examiningBody", label: "Exam Body"},

    // --- Next of Kin 1 ---
    {key: "nok1_firstName", label: "NOK 1 First Name"},
    {key: "nok1_lastName", label: "NOK 1 Last Name"},
    {key: "nok1_relationship", label: "NOK 1 Relationship"},
    {key: "nok1_phone", label: "NOK 1 Phone"},
    {key: "nok1_email", label: "NOK 1 Email"},

    // --- Next of Kin 2 ---
    {key: "nok2_firstName", label: "NOK 2 First Name"},
    {key: "nok2_lastName", label: "NOK 2 Last Name"},
    {key: "nok2_relationship", label: "NOK 2 Relationship"},
    {key: "nok2_phone", label: "NOK 2 Phone"},
    {key: "nok2_email", label: "NOK 2 Email"},

    // --- System Meta ---
    {key: "submitted", label: "Is Submitted?"},
    {key: "completionStatus", label: "Completion %"},
    {key: "createdAt", label: "Date Created"},
    {key: "updatedAt", label: "Last Updated"}
] as const;

// Types helpers
export type ApplicantExportKey = typeof COLUMN_CONFIG[number]["key"];
export type FlatApplicantExport = Record<ApplicantExportKey, string | number | boolean | null>;