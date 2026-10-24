import z from "zod";
import { BaseServiceClient } from "./BaseService.client";
import dayjs from "dayjs";

/*
  "event":           "TERM_ADVANCED",
  "eventId":         "EVT-20260910-S12345-Y1T2",
  "studentId":       "S12345",
  "programmeCode":   "DICT",
  "studentYear":     1,
  "studentTerm":     2,
  "enrollmentDate":  "2026-09-05",
  "studentCategory": "regular",
  "isNewStudent":    false,
  "enrolledBy":      "HOD-001"
*/

export interface EnrollSessionResponse {
	success: boolean;
	data: {
		enrollmentId: string;
		feeStructureApplied: {
			id: string;
			versionLabel: string;
			scopeType: string;
			validFrom: string;
			validTo: null | string;
			totalAmount: number;
		};
		obligations: [
			{
				id: string;
				type: string;
				studentYear: number;
				studentTerm: number;
				totalAmount: number;
				totalPaid: number;
				totalBalance: number;
				status: string;
				creditApplied: number;
			},
		];
		creditApplied: 2602.0;
		creditRemaining: 0.0;
	};
}

const createEnrollSessionSchema = z.object({
	event: z.enum(["TERM_ADVANCED"]),
	studentId: z.string(),
	studentRegNo: z.string(),
	studentName: z.string(),
	programmeCode: z.string(),
	studentYear: z.number(),
	studentTerm: z.number(),
	enrollmentDate: z.string().transform((arg) => {
		return dayjs(arg).format("YYYY-MM-DD");
	}),
	studentCategory: z.string(),
	isNewStudent: z.boolean(),
	enrolledBy: z.coerce.string(),
});

export class FinanceServiceClient extends BaseServiceClient {
	constructor() {
		super(process.env.NODE_ENV === "development" ? "http://localhost:5007/api" : "http://fees-service:8000/api");
	}

	enrollSession = async (payload: z.infer<typeof createEnrollSessionSchema>): Promise<EnrollSessionResponse> => {
		const { success, data, error } = z.safeParse(createEnrollSessionSchema, payload);
		if (!success) throw new Error(error.message);
		const response = await this.post<EnrollSessionResponse>("/enrollments", data);
		return response;
	};
}
