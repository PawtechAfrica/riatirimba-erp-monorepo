import dayjs from "dayjs";
import { Repository } from "typeorm";
import { enrollmentService } from ".";
import clients from "../clients";
import { CourseObj } from "../clients/Academics.client";
import { CourseModule, ModuleStatusEnum } from "../database/entities/CourseModule.entity";
import { Enrollment } from "../database/entities/Enrollment.entity";
import { AppError } from "../utils/AppErrorClasses";
import { EnrollmentService } from "./Enrollment.service";
import { ModelServiceBase } from "./ModelService.base";
import { en } from "zod/v4/locales";
import { TermSessionService } from "./TermSession.service";
import { TermSession } from "../database/entities/TermSession.entity";

export class CourseModuleService extends ModelServiceBase<CourseModule> {
	constructor(repo: Repository<CourseModule>) {
		super(repo);
	}

	async getModuleSessions() {
		return this.repo.find({});
	}

	getCurrentTermNumber() {
		// 1: Jan - April
		// 2: May - August
		// 3: September - December
		const currentMonth = dayjs().month() + 1;
		if (currentMonth <= 4) return 1;
		if (currentMonth >= 5 && currentMonth <= 8) return 2;
		return 3;
	}

	async autoEnrollModule(admissionNumber: string, enrolledBy: string) {
		return this.repo.manager.transaction(async (trx) => {
			const trxRepo = trx.getRepository(CourseModule);
			const trxEnrollmentService = new EnrollmentService(trx.getRepository(Enrollment));
			const trxTermSessionService = new TermSessionService(trx.getRepository(TermSession));

			// get active term session
			const termSession = await trxTermSessionService.getActiveTermSession();
			if (!termSession)
				throw new AppError(
					"No school session is currently ongoing! Please initiate a session before enrolling students!",
				);

			const enrollment = await trxEnrollmentService.findOneBy({
				where: { admissionNumber: admissionNumber },
				select: ["course", "student", "studentType", "modules", "newApplicant", "id"],
				relations: ["student", "modules"],
				order: { modules: { moduleNumber: "DESC" } },
			});
			if (!enrollment)
				throw new AppError("Please enroll the trainee into the course before registering for modules");
			if (!enrollment.student) throw new AppError("Student account not found! Please register the student first");

			// get the last module
			const lastModule = enrollment.modules[0];

			let termNumber = 1;
			let academicYear = 1;
			let moduleNumber = 1;
			const courseId = lastModule ? lastModule.courseId : enrollment.course;

			// if no last module, check if they have a course enrolled before creating a new one
			if (lastModule) {
				// check if last module is complete
				if (lastModule.status !== ModuleStatusEnum.COMPLETED)
					throw new AppError("You cannot enroll for the next module until the previous one is completed!");

				// create the next module
				// terms can't be greater than 3, if 3, adjust academicYear even in enrollment table
				termNumber = lastModule.termNumber >= 3 ? 1 : lastModule.termNumber + 1;
				academicYear = termNumber === 1 ? (lastModule.academicYear || 0) + 1 : lastModule.academicYear;
				moduleNumber = lastModule.moduleNumber + 1;

				// attempt confirming number of modules from academic service, do nothing if error occurs
				try {
					const result: CourseObj | undefined = await clients.academicServiceClient.courseById(
						lastModule.courseId,
					);
					// if (!result)
					// 	throw new AppError("We could not find the course. Please contact support if this is a mistake");
					// check if module number is valid
					if (result && moduleNumber > result.duration)
						throw new AppError(
							"You are trying to enroll for a module that does not exist in this course. Please contact support if this is a mistake",
						);
				} catch (error) {}
			}

			// update year of study in enrollment
			if (enrollment.yearOfStudy !== academicYear) {
				await trxEnrollmentService.update({ id: enrollment.id, yearOfStudy: academicYear });
			}

			const moduleToSave = trxRepo.create({
				enrollment: { id: enrollment.id },
				termNumber: termNumber,
				moduleNumber: moduleNumber,
				enroller: enrolledBy,
				academicYear: academicYear,
				courseId: courseId,
				session: termSession,
			});

			const createdModule = await trxRepo.save(moduleToSave);

			// notify finance service
			const studentName = `${enrollment.student!.firstName} ${(enrollment.student?.middleName || "") + " " || ""}${enrollment.student!.lastName}`;
			await clients.financeServiceClient.enrollSession({
				event: "TERM_ADVANCED",
				studentName: studentName,
				studentId: enrollment.student.id,
				programmeCode: enrollment.course.toString(),
				studentCategory: "regular",
				studentRegNo: admissionNumber,
				enrollmentDate: createdModule.createdAt.toString(),
				isNewStudent: enrollment.newApplicant,
				studentTerm: createdModule.termNumber,
				studentYear: createdModule.academicYear,
				enrolledBy: enrolledBy,
			});
			return createdModule;
		});
	}

	async enrollModule(
		admissionNumber: string,
		moduleNumber: number,
		// termNumber: number,
		enrolledBy: string,
		year?: number,
		enrollment?: Enrollment,
	): Promise<CourseModule> {
		return this.repo.manager.transaction(async (trx) => {
			const trxRepo = trx.getRepository(CourseModule);
			// Cannot enroll if the exact module is already enrolled and incomplete OR if the previous module is incomplete
			const cannotEnroll = await trxRepo.existsBy([
				{
					enrollment: { admissionNumber: admissionNumber },
					moduleNumber: moduleNumber,
					status: ModuleStatusEnum.IN_PROGRESS,
				},
				{
					enrollment: { admissionNumber: admissionNumber },
					moduleNumber: moduleNumber - 1,
					status: ModuleStatusEnum.IN_PROGRESS,
				},
			]);
			if (cannotEnroll)
				throw new AppError(
					"Cannot enroll: module already enrolled and incomplete, or previous module is incomplete",
				);

			const theEnrollment = enrollment
				? enrollment
				: await enrollmentService.findOneBy({
						where: { admissionNumber },
						select: ["course", "student"],
						relations: ["student"],
					});
			if (!theEnrollment) throw new Error("Trainee not enrolled in any course");

			try {
				// attempt to confirm the number of modules in the course
				const course: CourseObj | undefined = await clients.academicServiceClient.courseById(
					theEnrollment.course,
				);
				// confirm the number of modules in the course
				if (course && moduleNumber > course.duration)
					throw new AppError("You attempted to enroll in a module that does not exist in the course");
			} catch (err) {
				// todo: Log this Error
				// ignore, do not stop enrolling because you can't confirm the number of modules
			}

			// calculate term number, every 3 modules is one academic year and update in the enrollment
			const lastModule = await trxRepo.findOneBy({ moduleNumber: moduleNumber - 1 });
			let termNumber = 1;
			if (lastModule) termNumber = lastModule.termNumber + 1;
			if (termNumber > 3) termNumber = 1;

			// create the module
			const createdModule: CourseModule = trxRepo.create({
				enrollment: { id: theEnrollment.id },
				moduleNumber: moduleNumber,
				termNumber: termNumber,
				academicYear: year,
				status: ModuleStatusEnum.IN_PROGRESS,
				enroller: enrolledBy.toString(),
				courseId: theEnrollment.course,
			});
			await trxRepo.save(createdModule);

			const student = theEnrollment.student;
			let name = "";
			if (student) name = `${student.firstName} ${student.middleName + " "}${student.lastName}`;

			// inform finance service
			// await clients.financeServiceClient.enrollSession({
			// 	admissionNumber: admissionNumber,
			// 	enrolledBy: enrolledBy,
			// 	enrollmentDate: createdModule.createdAt,
			// 	isNewStudent: true,
			// 	studentTerm: termNumber,
			// 	name: name,
			// 	studentYear: year || new Date().getFullYear(),
			// });
			return createdModule;
		});
	}
}
