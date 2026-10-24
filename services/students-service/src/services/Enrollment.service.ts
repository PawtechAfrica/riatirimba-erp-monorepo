import { FindOneOptions, In } from "typeorm";
import { CreateEnrollmentDTO, UpdateEnrollmentDTO } from "../@types.global/dtos";
import { EnrollmentStatusEnum } from "../database/@types.database";
import { Enrollment } from "../database/entities/Enrollment.entity";
import { Student } from "../database/entities/Students.entity";
import { UpdateEnrollmentInput } from "../schema/enrollment.schema";
import { AppError } from "../utils/AppErrorClasses";
import { generateAdmissionNumber } from "../utils/generateAdmissionNumber";
import { ModelServiceBase } from "./ModelService.base";
import clients from "../clients";
import admissionService from "./admission.service";

export class EnrollmentService extends ModelServiceBase<Enrollment> {
	// get repo() {
	// 	return AppDataSource.getRepository(Enrollment);
	// }

	async findOneBy(options: FindOneOptions<Enrollment>) {
		return this.repo.findOne({ ...options, order: { modules: { moduleNumber: "ASC" } } });
	}

	async create(payload: CreateEnrollmentDTO, student: Student) {
		// check they don't have another enrollment in progress
		const cannotEnrollInNewCourse = await this.repo.existsBy({
			student: student,
			status: In([EnrollmentStatusEnum.ACTIVE, EnrollmentStatusEnum.ATTACHMENT]),
		});
		if (cannotEnrollInNewCourse)
			throw new AppError("Applicant is enrolled in another course that is not completed");
		const created = this.repo.create({ ...payload, student: student });
		// todo: create their first module by default
		return this.repo.save(created);
	}

	async updateEnrollment(
		enrollmentId: bigint,
		traineeId: string,
		payload: UpdateEnrollmentInput,
		auto = false,
	): Promise<Enrollment> {
		// find the enrollment
		const found = await this.repo.findOneBy({ id: enrollmentId, student: { id: traineeId } });
		if (!found) throw new AppError("Please check the credentials or enroll the trainee to a course first!");

		const { admissionNumber, course, intake, ...rest } = payload;

		Object.assign(found, { ...rest });
		// if intake changed and auto is true, auto-update the admission number
		const courseTrack = {
			id: course ? course : found.course,
			changed: course && course !== found.course,
		};
		const intakeTrack = {
			id: intake ? intake : found.intake,
			changed: intake !== found.intake,
		};
		const admissionNumTrack = {
			admissionNumber: admissionNumber ? admissionNumber : found.admissionNumber,
			changed: admissionNumber !== found.admissionNumber,
		};
		if (auto) {
			// auto-generate admission number
			if (courseTrack.changed || intakeTrack.changed) {
				const count = await this.repo.countBy({ course: courseTrack.id, intake: intakeTrack.id });
				found.admissionNumber = await generateAdmissionNumber(courseTrack.id, intakeTrack.id, count);
				if (courseTrack.changed) {
					const courseDetails = await clients.academicServiceClient.courseAndDepartment(courseTrack.id);
					if (
						!courseDetails.department ||
						(courseDetails.course && courseDetails.course.id !== courseTrack.id)
					)
						throw new AppError("Course not found or does not belong to the department");
					found.department = courseDetails.department.id;
				}
			}
		} else {
			if (courseTrack.changed) found.course = courseTrack.id;
			if (intakeTrack.changed) found.intake = intakeTrack.id;
			if (admissionNumTrack.changed) found.admissionNumber = admissionNumTrack.admissionNumber;
		}
		// todo: There's still more work to do, there's a question of changing courses, what happens to modules and how does that affect modules
		return this.repo.save(found);
	}

	// needs more work. changing course should update admission number (either automatically or manually)
	async update(payload: UpdateEnrollmentDTO) {
		const enrollment = await this.repo.findOne({ where: { id: payload.id }, loadRelationIds: true });
		if (!enrollment) throw new Error("Enrollment not found");

		const { intake, admissionNumber, course, id, ...notSpecial } = payload;
		const intakeVar = payload.intake
			? payload.intake == enrollment.intake
				? enrollment.intake
				: payload.intake
			: enrollment.intake;
		// Change admission number if course changes and is an exising student (not new Applicant)
		// todo: this process is a bit more complex than just updating the course
		if (payload.course && enrollment.course !== payload.course) {
			// update course
			enrollment.course = payload.course;
			// change admission number if a student is a new applicant
			if (enrollment.newApplicant) {
				// count people in that course
				const count = await this.repo.countBy({ course: payload.course });
				// generate new admission number
				enrollment.admissionNumber = await generateAdmissionNumber(payload.course, intakeVar, count);
			}
		}
		enrollment.intake = intakeVar;

		await this.repo.update({ id: enrollment.id }, { ...notSpecial });
		return enrollment;
	}
}
