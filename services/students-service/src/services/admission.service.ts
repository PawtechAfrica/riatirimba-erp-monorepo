import appRoot from "app-root-path";
import path from "path";
import { studentService } from ".";
import { AdmissionLetterPayload } from "../@types.global";
import clients from "../clients";
import { AcademicServiceClient } from "../clients/Academics.client";
import { AppError } from "../utils/AppErrorClasses";
import { generatePdfBuffer } from "../utils/sharedFunctions";
import bullMqService from "./bullmq.service";

class AdmissionService {
	private get admissionLetterTemplate() {
		return path.join(appRoot.path, "src", "templates", "admission.template.ejs");
	}

	constructor(private readonly academicService: AcademicServiceClient) {}

	async generateAdmissionLetter(applicant_id: string, intake_period: string) {
		// find applicant
		const studentApplicant = await studentService.findOneById(applicant_id);
		if (!studentApplicant) throw new AppError("Applicant not found", 404);

		const enrollmentWithIntake = studentApplicant.enrollments.find((enr) => enr.intake === intake_period);
		if (!enrollmentWithIntake) throw new AppError("No enrollment found for the given intake period", 404);

		const courseAndDepartment = await this.academicService.courseAndDepartment(enrollmentWithIntake.course);
		if (!courseAndDepartment.course) throw new AppError("Course not found", 404);
		if (!courseAndDepartment.department) throw new AppError("Department not found", 404);

		const dataObject: AdmissionLetterPayload = {
			admissionNumber: enrollmentWithIntake.admissionNumber,
			email: studentApplicant.email,
			name: `${studentApplicant.firstName} ${studentApplicant.middleName + " " || ""}${studentApplicant.lastName}`,
			course: courseAndDepartment.course.name,
			department: courseAndDepartment.department.name,
		};

		return await generatePdfBuffer(this.admissionLetterTemplate, { student: dataObject });
	}

	async sendAdmissionEmail(
		email: string,
		firstName: string,
		lasName: string,
		course: number,
		admissionNumber: string,
		middleName?: string,
	) {
		const result = await this.academicService.courseAndDepartment(course);
		if (!result.course || !result.department)
			// todo: handle this error reporting
			throw new Error(
				`Course or Department not found for course: ${course} and department: ${result.department?.name}`,
			);
		const data: AdmissionLetterPayload = {
			email,
			admissionNumber,
			name: `${firstName} ${middleName + " " || ""}${lasName}`,
			course: result.course.name + ` Level ${result.course.level}`,
			department: result.department.name,
		};
		return await bullMqService.admissionEmailQueue
			.add("send-admission-email", data, {
				attempts: 5,
				backoff: { type: "exponential", delay: 5000 },
			})
			.catch((err) => {
				throw new AppError(err);
			});
	}
}

export default new AdmissionService(clients.academicServiceClient);
