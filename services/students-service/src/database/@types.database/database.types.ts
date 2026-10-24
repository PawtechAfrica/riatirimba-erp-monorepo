import { Student } from "../entities/Students.entity";

export enum GenderEnum {
	MALE = "M",
	FEMALE = "F",
}

export interface NextOfKinObj {
	firstName: string;
	lastName: string;
	email?: string;
	phone: string;
	relationship: string;
	student: Student;
}

export enum EducationLevelEnum {
	PRIMARY_SCHOOL = "primary",
	HIGH_SCHOOL = "secondary",
	TERTIARY = "tertiary",
}

export enum StudentTypeEnum {
	KUCCPS__GOVT_SPONSORED = "KUCCPS",
	PrivateSponsored = "PSS",
	NYS_Sponsored = "NYS",
}

export enum TertiaryLevel {
	CERTIFICATE = "cert",
	DIPLOMA = "dip",
	DEGREE = "deg",
}

export enum ExamBody {
	KNEC = "KNEC",
	CDACC = "CDACC",
}

export enum EnrollmentStatusEnum {
	ACTIVE = "active",
	ATTACHMENT = "attachment",
	GRADUATED = "graduated",
	SUSPENDED = "suspended",
	DROPPED_OUT = "dropout",
}

export enum IdTypeEnum {
	BIRTH_CERTIFICATE = "birthCertificate",
	NATIONAL_ID = "nationalId",
}

export enum GradeEnum {
	A_PLAIN = "A",
	A_MINUS = "A-",
	B_PLUS = "B+",
	B_PLAIN = "B",
	B_MINUS = "B-",
	C_PLUS = "C+",
	C_PLAIN = "C",
	C_MINUS = "C-",
	D_PLUS = "D+",
	D_PLAIN = "D",
	D_MINUS = "D-",
	E = "E",
}

export type AcademicHistoryObj =
	| {
			primarySchool: string;
			highSchool?: string;
			kcseIndexNumber: string;
			kcseGrade: GradeEnum;
			newApplicant: false;
			admissionNumber: string;
			basicEducationLevel: EducationLevelEnum;
	  }
	| {
			primarySchool: string;
			highSchool?: string;
			kcseIndexNumber: string;
			kcseGrade: GradeEnum;
			newApplicant: true;
			basicEducationLevel: EducationLevelEnum;
	  };
