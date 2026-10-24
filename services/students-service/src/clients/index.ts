import { AcademicServiceClient } from "./Academics.client";
import { AdmissionServiceClient } from "./Admission.client";
import { FinanceServiceClient } from "./FinanceService.client";

const academicServiceClient = new AcademicServiceClient();
const admissionServiceClient = new AdmissionServiceClient();
const financeServiceClient = new FinanceServiceClient();

export default {
	academicServiceClient,
	admissionServiceClient,
	financeServiceClient,
};

export type { EnrollSessionResponse } from "./FinanceService.client";
