import express from "express";

export interface AppRequest extends express.Request {
	user?: {
		sub: string; // somehow is the user id, todo: change this after deploying new auth service
		email: string;
		role: string;
		permissions: string[];
	};
}

export type ReqHandler = (req: AppRequest, res: express.Response, next: express.NextFunction) => void | Promise<void>;

export type PaginatedStudentResponse<T> = {
	page: number;
	pageSize: number;
	lastPageIs: number;
	data: T[];
};

export type AdmissionLetterPayload = {
	email: string;
	name: string;
	admissionNumber: string;
	course: string;
	department: string;
};
// export type FileOutputName = `${string}.docx`
export type FileOutputName = `${string}.odt`;
