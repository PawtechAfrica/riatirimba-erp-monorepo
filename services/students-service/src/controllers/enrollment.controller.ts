import { CreateEnrollmentDTO } from "../@types.global/dtos";
import { UpdateEnrollmentInput, UpdateEnrollmentRequest } from "../schema/enrollment.schema";
import { studentService } from "../services";
import { EnrollmentService } from "../services/Enrollment.service";
import { AppError } from "../utils/AppErrorClasses";
import { tryCatchAsync } from "../utils/tryCatchAsync";
import { validateDTO } from "../utils/validateDTO";

export class EnrollmentController {
	constructor(protected service: EnrollmentService) {}

	createEnrollment = tryCatchAsync(async (req, res) => {
		if (!req.body || !req.params.student_id || req.params.student_id == "undefined")
			throw new Error("Invalid request. No data provided!");
		const validated = await validateDTO(CreateEnrollmentDTO, req.body);
		const student = await studentService.findOneById(req.params.student_id as string);
		if (!student) throw new AppError("Student not found!", 404);
		const created = await this.service.create(validated, student);
		res.status(201).json({
			message: "Enrollment created successfully!",
			data: created,
		});
	});

	updateEnrollment = tryCatchAsync(async (req, res) => {
		const { traineeId, enrollmentId, auto } = req.params as unknown as UpdateEnrollmentRequest["params"];
		const payload = req.body as unknown as UpdateEnrollmentInput;

		const updated = await this.service.updateEnrollment(enrollmentId, traineeId, payload, auto);
		// consider sending notification to student
		res.status(200).json({
			message: "Enrollment updated successfully!",
			data: updated,
		});
	});
}
