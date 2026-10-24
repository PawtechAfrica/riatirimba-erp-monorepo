import { plainToInstance } from "class-transformer";
import { QueryFailedError } from "typeorm";
import { PaginatedStudentResponse } from "../@types.global";
import { StudentResponseDTO, UpdateStudentDTO } from "../@types.global/dtos";
import { Student } from "../database/entities/Students.entity";
import {
	DownloadAdmissionLetterInput,
	FetchPaginatedStudentsInput,
	UpdateTraineeInput,
} from "../schema/student.schema";
import { StudentsService } from "../services/Students.service";
import { AppError } from "../utils/AppErrorClasses";
import { tryCatchAsync } from "../utils/tryCatchAsync";
import { validateDTO } from "../utils/validateDTO";

export class StudentsController {
	constructor(private readonly service: StudentsService) {}

	searchStudents = tryCatchAsync(async (req, res) => {
		const { query } = req.query;
		if (!query) throw new AppError("Query parameter is required", 400);
		const students = await this.service.search(query as string);
		res.status(200).json({
			message: "Students found successfully",
			data: students,
		});
	});

	createStudent = tryCatchAsync(async (req, res) => {
		try {
			if (!req.body) throw new AppError("Invalid request");
			const newStudent = await this.service.create(req.body);
			res.status(200).json({
				message: "Student created successfully",
				data: plainToInstance(StudentResponseDTO, newStudent),
			});
		} catch (err: unknown) {
			if (err instanceof QueryFailedError) {
				const pgErr = err as any;
				if (pgErr.code == "23505") throw new AppError("Student with similar credentials already exists", 409);
			}
			throw err;
		}
	});

	updateStudent = tryCatchAsync(async (req, res) => {
		const { id } = req.params as unknown as UpdateTraineeInput["params"];
		const validated = await validateDTO(UpdateStudentDTO, req.body);
		const result = await this.service.updateStudent(id, validated);
		if (!result) throw new AppError("Student not found!", 404);
		res.status(200).json({
			message: "Student updated successfully!",
			data: result,
		});
	});

	createManyStudents = tryCatchAsync(async (req, res) => {
		if (!req.body) throw new AppError("Invalid request");
		console.log("✅ Passing data to service.createMany");
		const { success, failures } = await this.service.createMany([...req.body]);
		console.log(`✅ Service.createMany\n\tSuccess: ${success.length}  Fail: ${failures.length}`);
		res.status(200).json({
			message: "Student created successfully",
			success,
			failures,
		});
	});

	getById = tryCatchAsync(async (req, res) => {
		const id = req.params["id"];
		if (!id) throw new AppError("Please check your request and try again!");
		const found = await this.service.findOneById(id as string);
		if (!found) throw new AppError("Student not found!", 404);
		res.status(200).json(found);
	});

	filter = tryCatchAsync(async (req, res) => {
		console.log("Running...");
		const result = await this.service.filter(req.query as any);
		res.status(200).json(result);
	});

	getStudentsByPage = tryCatchAsync(async (req, res) => {
		const { intake, count, page } = req.query as unknown as FetchPaginatedStudentsInput["query"];
		const result = await this.service.findByPage(intake, page, count);
		res.status(200).json(result satisfies PaginatedStudentResponse<Student>);
	});
	deleteStudentByID = tryCatchAsync(async (req, res) => {
		const id = req.params["id"];
		if (!id) throw new AppError("Please check your request and try again!");
		await this.service.deleteById(id as string);
		res.status(200).json({
			message: "Student deleted successfully",
		});
	});

	downloadAdmissionLetter = tryCatchAsync(async (req, res) => {
		// const applicant_birthCert_no = req.params.birthCert!;
		// const intake = req.params.intake!;
		const { intake, birthCert } = req.params as unknown as DownloadAdmissionLetterInput["params"];
		// if (!applicant_birthCert_no || applicant_birthCert_no === "undefined")
		// 	throw new AppError("No credentials provided!");
		const pdfBuffer = await this.service.downloadAdmissionLetter(birthCert, intake);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename=${birthCert}.pdf`);
		res.send(pdfBuffer);
	});
}
