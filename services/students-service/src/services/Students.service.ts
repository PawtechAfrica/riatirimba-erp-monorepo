import dayjs from "dayjs";
import fs from "fs";
import libre from "libreoffice-convert";
import path from "path";
import { FindManyOptions, FindOptionsWhere, ILike } from "typeorm";
import { FileOutputName, PaginatedStudentResponse } from "../@types.global";
import { CreateStudentDTO, UpdateStudentDTO } from "../@types.global/dtos";
import clients from "../clients";
import { AppDataSource } from "../database/data-source";
import { NextOfKin } from "../database/entities/NextOfKin.entity";
import { Student } from "../database/entities/Students.entity";
import { FilterStudentSchemaType } from "../schema/student.schema";
import { AppError } from "../utils/AppErrorClasses";
import { fillWordTemplate } from "../utils/fillWordTemplate";
import { admissionTemplate } from "../utils/objects";
import { arrayHasAtLeast } from "../utils/typescript.utils";
import { validateDTO } from "../utils/validateDTO";
import admissionService from "./admission.service";
import { ModelServiceBase } from "./ModelService.base";

// const ADMISSION_TEMPLATE_PATH = path.join(__dirname, "../resources/templates/admission_2024.docx");
const ADMISSION_TEMPLATE_PATH = path.join(__dirname, "../resources/templates/admission_2024.docx");

function parseIntakeParam(intake: string): string[] {
	const result = [intake];
	const yyyyMmRegex = /^(\d{4})-(\d{2})$/;
	const periodYearRegex = /^(JAN|MAY|SEP)-(\d{4})$/i;

	const monthToPeriod: Record<string, string> & { [key: string]: "JAN" | "MAY" | "SEP" } = {
		"01": "JAN",
		"05": "MAY",
		"09": "SEP",
	};

	const periodToMonth: Record<string, string> = {
		JAN: "01",
		MAY: "05",
		SEP: "09",
	};

	const yyyyMmMatch = intake.match(yyyyMmRegex);
	if (yyyyMmMatch) {
		const [_, year, month] = yyyyMmMatch;
		if (!month) throw new AppError("Invalid month in intake");
		const period = monthToPeriod[month];
		if (period) {
			result.push(`${period}-${year}`);
		}
	}

	const periodYearMatch = intake.match(periodYearRegex);
	if (periodYearMatch) {
		const [_, period, year] = periodYearMatch;
		if (!period) throw new AppError("Invalid period in intake");
		const month = periodToMonth[period.toUpperCase()];
		if (month) {
			result.push(`${year}-${month}`);
		}
	}

	return result;
}

export class StudentsService extends ModelServiceBase<Student> {
	async search(query: string): Promise<Student[]> {
		return this.repo.find({
			where: [
				{ firstName: ILike(`%${query}%`), deleted: false },
				{ middleName: ILike(`%${query}%`), deleted: false },
				{ lastName: ILike(`%${query}%`), deleted: false },
				{ email: ILike(`%${query}%`), deleted: false },
				{ phone: ILike(`%${query}%`), deleted: false },
				{ enrollments: { admissionNumber: ILike(`%${query}%`) }, deleted: false },
			],
			relations: ["enrollments"],
			take: 100,
			order: {
				createdAt: "DESC",
			},
		});
	}

	async createMany(batch: Partial<Student>[]): Promise<{ success: Student[]; failures: any[] }> {
		const success: Student[] = [];
		const failures: any[] = [];

		// Process students in parallel with individual transactions
		const results = await Promise.allSettled(
			batch.map(async (applicant, index): Promise<{ success: Student; index: number }> => {
				const queryRunner = this.repo.manager.connection.createQueryRunner();
				await queryRunner.connect();

				try {
					await queryRunner.startTransaction();
					// validate the user object
					// const validated = await validateDTO(CreateStudentDTO, applicant);
					const { address, nextOfKins, enrollments, academicHistory, ...rest } = applicant;
					const addy = address ? { ...address, id: undefined } : {};
					const acHist = { ...academicHistory, id: undefined };
					const nOks = nextOfKins?.map((nok) => ({ ...nok, id: undefined })) ?? [];

					const enrolls =
						enrollments?.map((enrollment) => ({
							...enrollment,
							yearOfStudy:
								!enrollment.yearOfStudy ||
								Number.isNaN(parseInt(enrollment.yearOfStudy.toString())) ||
								enrollment.yearOfStudy < 1
									? 1
									: enrollment.yearOfStudy,
							id: undefined,
						})) ?? [];
					const student = await queryRunner.manager.save(Student, {
						...rest,
						academicHistory: acHist,
						address: addy,
						nextOfKins: nOks,
						enrollments: enrolls,
					});
					await queryRunner.commitTransaction();
					return { success: student, index };
				} catch (error) {
					console.log(error);
					console.log("-".repeat(50));
					await queryRunner.rollbackTransaction();
					throw { error, applicant, index };
				} finally {
					await queryRunner.release();
				}
			}),
		);

		// Process results
		for (const result of results) {
			if (result.status === "fulfilled") {
				success.push(result.value.success);
				const created = result.value.success;
				// Assume that course is always present by this stage
				const course = created.enrollments[0]!;
				await admissionService.sendAdmissionEmail(
					created.email,
					created.firstName,
					created.lastName,
					course.course,
					course.admissionNumber,
					created.middleName,
				);
			} else {
				const { error, applicant, index } = result.reason;
				console.error(`🚩 Failed to save student at index ${index}:`, error.message);
				failures.push({
					index,
					student: applicant,
					error: error instanceof AppError ? error.validations : error.message,
					// stack: error.stack
				});
			}
		}
		// results.forEach((result) => {
		//     if (result.status === "fulfilled") {
		//         success.push(result.value.success);
		//         const created = result.value.success
		//         const course = created.enrollments[-1]
		//         await admissionService.sendAdmissionEmail(
		//             created.email, created.firstName, created.lastName, course.course, created.middleName
		//         )
		//     } else {
		//         const {error, applicant, index} = result.reason;
		//         console.error(`🚩 Failed to save student at index ${index}:`, error.message);
		//         console.log(applicant);
		//         failures.push({
		//             index,
		//             student: applicant,
		//             error: error instanceof AppError ? error.validations : error.message,
		//             // stack: error.stack
		//         });
		//     }
		// });
		return { success, failures };
	}

	async create(payload: Partial<Student>): Promise<Student> {
		// validate
		const validated = await validateDTO(CreateStudentDTO, payload);
		// create nextOfKin
		return AppDataSource.manager.transaction(async (em) => {
			// Initialize context-specific repo
			const studentRepo = em.getRepository(Student);
			const newStudent = studentRepo.create(validated);
			return this.repo.save(newStudent);
		});
	}

	async updateStudent(id: string, data: UpdateStudentDTO) {
		return await this.repo.manager.transaction(async (em) => {
			const repo = em.getRepository(Student);
			const result = await repo.update(id, data);
			if (!result.affected) return null;
			return await repo.findOneBy({ id });
		});
	}

	async countStudents(where?: FindOptionsWhere<Student>): Promise<number> {
		return await this.repo.count({ where: where ? where : {} });
	}

	async filter({
		intake,
		course,
		term,
		department,
		gender,
		page = 1,
		count = 20,
	}: FilterStudentSchemaType): Promise<PaginatedStudentResponse<Student>> {
		// 1) resolve department -> courseIds (if department filter provided)
		let depCourses: number[] = [];
		if (typeof department !== "undefined" && department !== null) {
			const departments = await clients.academicServiceClient.allDepartmentsAndCourses(); // returns DepartmentObj[]
			const dept = departments.find((d) => Number(d.id) === Number(department));
			if (!dept) {
				// department provided but not found -> return empty paginated response
				return {
					page,
					lastPageIs: 0,
					pageSize: count,
					data: [],
				};
			}
			depCourses = dept.courses.map((c) => c.id);
		}

		// 2) build query
		const qb = AppDataSource.getRepository(Student)
			.createQueryBuilder("student")
			.leftJoinAndSelect("student.enrollments", "enrollment")
			.where("student.deleted = false");

		// course filter
		if (typeof course !== "undefined" && course !== null) {
			qb.andWhere("enrollment.course = :course", { course });
		}

		// department filter
		if (typeof department !== "undefined" && department !== null) {
			if (depCourses.length > 0) {
				qb.andWhere(
					"(enrollment.department = :department OR (enrollment.department IS NULL AND enrollment.course IN (:...depCourses)))",
					{ department, depCourses },
				);
			} else {
				qb.andWhere("enrollment.department = :department", { department });
			}
		}

		// gender filter
		if (typeof gender !== "undefined" && gender !== null) {
			qb.andWhere("student.gender = :gender", { gender });
		}

		// default intake as either a monthYearKey string or literal "all" to filter across all intakes
		const intakeFilter = intake || "all";
		if (intakeFilter !== "all") {
			const intakeVariations = parseIntakeParam(intakeFilter);
			qb.andWhere("enrollment.intake IN (:...intakeVariations)", { intakeVariations });
		}

		// term (search) across name/email/phone
		if (term && term.trim() !== "") {
			qb.andWhere(
				`(
        student.firstName ILIKE :term OR
        student.middleName ILIKE :term OR
        student.lastName ILIKE :term OR
        student.email ILIKE :term OR
        student.phone ILIKE :term
      )`,
				{ term: `%${term}%` },
			);
		}

		// deterministic ordering and pagination
		qb.orderBy("student.createdAt", "DESC")
			.distinct(true)
			.skip((page - 1) * count)
			.take(count);

		const [students, total] = await qb.getManyAndCount();

		return {
			page,
			lastPageIs: total === 0 ? 0 : Math.ceil(total / count),
			pageSize: count,
			data: students,
		};
	}

	/**
	 * @description - Fetches all non-deleted students
	 * @param relations - Search queries
	 */
	async findAll({ where, ...rest }: FindManyOptions<Student>): Promise<Student[]> {
		return this.repo.find({ where: { ...where, deleted: false }, ...rest });
	}

	async findByPage(intake = "all", page = 1, count = 100): Promise<PaginatedStudentResponse<Student>> {
		const whereCriteria: FindOptionsWhere<Student> = intake !== "all" ? { enrollments: { intake: intake } } : {};

		const allStudents = await this.findAll({
			where: whereCriteria,
			order: { createdAt: "DESC", enrollments: { createdAt: "ASC" } },
			skip: (page - 1) * count,
			take: count,
			relations: ["nextOfKins", "enrollments", "address", "academicHistory", "documents"],
		});
		return {
			data: allStudents,
			page,
			pageSize: count,
			lastPageIs: Math.ceil((await this.countStudents(whereCriteria)) / count),
		};
	}

	async findOneById(studentId: string): Promise<Student | null> {
		return this.repo.findOne({
			where: { id: studentId },
			relations: ["nextOfKins", "enrollments", "address", "academicHistory", "documents", "enrollments.modules"],
		});
	}

	async deleteById(studentId: string): Promise<void> {
		const found = await this.repo.findOneBy({ id: studentId });
		if (!found) throw new AppError("Student not found", 404);
		found.deleted = true;
		await this.repo.save(found);
	}

	async downloadAdmissionLetter(birthCertNumber: string, intake: string): Promise<Buffer> {
		// check if the file exists in the folder
		// let filePath = path.join(__dirname, `../../downloads/${applicantId}.docx`);
		let filePath = path.join(__dirname, `../../downloads/${birthCertNumber}.odt`);
		if (!fs.existsSync(filePath)) {
			// generate it
			filePath = await this.generateAdmissionLetter(birthCertNumber, intake);
		}
		// convert docx to pdf
		const file = fs.readFileSync(filePath);
		return new Promise((resolve, reject) => {
			libre.convert(file, "pdf", undefined, (err, done) => {
				if (err) reject(err);
				else resolve(done);
			});
		});
	}

	async generateAdmissionLetter(birthCertNo: string, intake: string) {
		const student = await this.repo.findOne({
			where: { birthCertNumber: birthCertNo },
			relations: ["address", "enrollments", "nextOfKins"],
		});
		if (!student) throw new AppError("Wrong credentials. Please try again later.");
		// check the template exists
		if (!fs.existsSync(ADMISSION_TEMPLATE_PATH))
			throw new AppError("We're still working on this. Come back later. Thank you for your patience.");

		const template = fs.readFileSync(ADMISSION_TEMPLATE_PATH);

		const enrollment = student.enrollments.find((e) => e.intake == intake);
		if (!enrollment)
			throw new AppError(
				"We could not find your enrollment details for this intake! Please check and try again.",
			);
		const course = await clients.academicServiceClient.courseAndDepartment(enrollment.course);
		const nextOfKins = student.nextOfKins;
		if (!arrayHasAtLeast(nextOfKins, 1)) throw new AppError("No next of kin found!");
		const nok1 = nextOfKins[0];
		const nok2: NextOfKin | undefined = nextOfKins[1];

		// fill the letter
		const data: admissionTemplate = {
			admissionNumber: enrollment.admissionNumber,
			birthCert: student.birthCertNumber, //student.idType === IdTypeEnum.NATIONAL_ID ? "N/A" : student.idNumber?.toString() ?? "",
			idNumber: student.idNumber || "N/A", //student.idType === IdTypeEnum.BIRTH_CERTIFICATE ? "N/A" : student.idNumber?.toString() ?? "",
			phone: student.phone,
			county: student.address.county ?? "",
			course: course.course?.name.toString() ?? "",
			date: dayjs(student.createdAt).format("DD MMM YYYY") ?? "",
			department: course.department?.name ?? "",
			email: student.email,
			firstName: student.firstName,
			middleName: student.middleName ?? " ",
			lastName: student.lastName,
			gender: student.gender === "M" ? "MALE" : "FEMALE",
			jan: enrollment.intake.toLowerCase().includes("jan") ? "U+2705" : " ",
			may: enrollment.intake.toLowerCase().includes("may") ? "U+2705" : " ",
			sep: enrollment.intake.toLowerCase().includes("sep") ? "U+2705" : " ",
			nok1Name: nok1 ? `${nok1.firstName} ${nok1.lastName}` : "N/A",
			nok1Phone: nok1.phone || "N/A",
			nok1Relationship: nok1.relationship,
			nok2Name: nok2 ? `${nok2?.firstName ?? ""} ${nok2?.lastName ?? ""}` : "N/A",
			nok2Phone: nok2?.phone ?? "N/A",
			nok2Relationship: nok2?.relationship ?? "N/A",
			town: student.address.subLocation ?? "N/A",
			village: student.address.village ?? "N/A",
			poBox: student.address.poBox ?? "N/A",
			code: student.address.zipCode ?? "N/A",
			ref: `${dayjs().year()}-${Math.floor(Math.random() * 1000)}`,
			day: dayjs(student.birthday).day().toString(),
			month: dayjs(student.birthday).month().toString(),
			year: dayjs(student.birthday).year().toString(),
		};
		const docxName: FileOutputName = `${student.id}.odt`;
		const finalPath = await fillWordTemplate(docxName, template, data);
		// schedule delete
		setTimeout(() => {
			fs.unlinkSync(finalPath);
		}, 300000);

		return finalPath;
	}
}
