import { BaseController } from "./Base.controller";
import AdmissionService from "../services/admission.service";
import { tryCatchAsync } from "../utils/tryCatchAsync";
import { AppError } from "../utils/AppErrorClasses";
import { studentService } from "../services";
import { DownloadAdmissionLetterSchemaObj } from "../schema/admission.schema";
import { arrayHasAtLeast } from "../utils/typescript.utils";

export class AdmissionController extends BaseController<typeof AdmissionService> {
	constructor(service: typeof AdmissionService) {
		super(service);
	}

	downloadAdmissionLetter = tryCatchAsync(async (req, res) => {
		const { applicant_id, intake_period } = req.params as DownloadAdmissionLetterSchemaObj["params"];
		const pdfBuffer = await this.service.generateAdmissionLetter(applicant_id, intake_period);
		res.setHeader("Content-Type", "application/pdf");
		res.send(pdfBuffer);
	});

	triggerAdmissionEmail = tryCatchAsync(async (req, res) => {
		const studentId = req.params.student_id;
		if (!studentId) throw new AppError("Invalid request!");
		// fetch student data
		const student = await studentService.findOneById(studentId as string);
		if (!student) throw new AppError("Student records not found!");

		const enrollment = student.enrollments[student.enrollments.length - 1];
		if (!enrollment) throw new AppError("No enrollment records found!");
		// send email
		const result = await this.service.sendAdmissionEmail(
			student.email,
			student.firstName,
			student.lastName,
			enrollment.course,
			enrollment.admissionNumber,
			student.middleName,
		);
		if (result)
			res.status(200).json({
				message: "Admission email sent successfully!",
			});
		else throw new AppError("Failed to send admission email. Please try again later!");
	});
}
