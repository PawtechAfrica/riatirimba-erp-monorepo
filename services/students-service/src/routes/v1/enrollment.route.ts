import { Router } from "express";
import { EnrollmentController } from "../../controllers/enrollment.controller";
import { enrollmentService } from "../../services";
import validateSchema from "../../middleware/schema.middleware";
import enrollmentSchema from "../../schema/enrollment.schema";

const enrollmentRoutes = Router();
const handler = new EnrollmentController(enrollmentService);

enrollmentRoutes
	.post("/create/:student_id", handler.createEnrollment)
	.post(
		"/update/:traineeId/:enrollmentId/:auto",
		validateSchema(enrollmentSchema.updateEnrollmentRequestSchema),
		handler.updateEnrollment,
	);

export default enrollmentRoutes;
