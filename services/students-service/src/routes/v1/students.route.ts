import express from "express";
import { StudentsController } from "../../controllers/students.controller";
import validateSchema from "../../middleware/schema.middleware";
import * as auth from "../../middleware/verifyJWT";
import studentSchema from "../../schema/student.schema";
import { studentService } from "../../services";

const studentRouter = express.Router();

// initialise route controller
const controller = new StudentsController(studentService);

// define routes
studentRouter
	.get(
		"/filter",
		auth.verifyJWT("fetch_all_trainees"),
		validateSchema(studentSchema.filterStudentSchema),
		controller.filter,
	)
	.get("/search", auth.verifyJWT("fetch_all_trainees"), controller.searchStudents)
	.get(
		"/admission-letter/:intake/:birthCert",
		validateSchema(studentSchema.downloadAdmissionLetterSchema),
		controller.downloadAdmissionLetter,
	)
	.post("/new", auth.verifyJWT("create_trainee"), controller.createStudent)
	.get(
		"/all",
		auth.verifyJWT("fetch_all_trainees"),
		validateSchema(studentSchema.fetchPaginatedStudentsSchema),
		controller.getStudentsByPage,
	)
	.get("/:id", auth.verifyJWT("fetch_all_trainees"), controller.getById)
	.post(
		"/update/:id",
		auth.verifyJWT("update_trainee"),
		validateSchema(studentSchema.updateTraineeSchema),
		controller.updateStudent,
	)
	.post("/create-many", controller.createManyStudents)
	.delete("/:id", auth.verifyJWT("delete_trainee"), controller.deleteStudentByID);

export default studentRouter;
