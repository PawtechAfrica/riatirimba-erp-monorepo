export interface OneIntakeStatResponseDTO {
    monthYear: string;
    applicants: IntakeApplicantsObj;
    total: number;
    admitted: number;
    acceptanceRate: number;
}

export interface IntakeApplicantsObj {
    M: number;
    F: number;
    unspecified: number;
}
