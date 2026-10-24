import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import services from "../../services";
import { AppError } from "../../utils/AppErrorClasses";
import { generateAdmissionNumber } from "../../utils/generateAdmissionNumber";
import { Enrollment } from "../entities/Enrollment.entity";
import { Student } from "../entities/Students.entity";

@EventSubscriber()
export class EnrollmentSubscriber implements EntitySubscriberInterface<Enrollment> {
	listenTo() {
		return Enrollment;
	}

	private async generateAdmissionNumberForEnrollment(
		event: InsertEvent<Enrollment> | UpdateEvent<Enrollment>,
	): Promise<void> {
		if (!event.entity) return;

		const { intake, course } = event.entity;

		if (!intake) {
			throw new AppError("Intake is required for generating admission number!");
		}
		if (!course) {
			throw new AppError("Course is required for generating admission number!");
		}

		const repository = event.manager.getRepository(Enrollment);
		const count = await repository.countBy({ intake, course });

		event.entity.admissionNumber = await generateAdmissionNumber(course, intake, count);
	}

	async beforeInsert(event: InsertEvent<Enrollment>): Promise<void> {
		if (!event.entity?.admissionNumber) {
			await this.generateAdmissionNumberForEnrollment(event);
		}
	}

	async beforeUpdate(event: UpdateEvent<Enrollment>): Promise<void> {
		if (!event.entity) return;
		// await this.handleAdmissionNumberUpdate(event);
		await this.handleStudentStatusSync(event);
	}

	private async handleStudentStatusSync(event: UpdateEvent<Enrollment>): Promise<void> {
		const statusWasUpdated = event.updatedColumns?.find((col) => col.propertyName === "status");
		const studentId = typeof event.entity?.student === "object" ? event.entity?.student.id : event.entity?.student;
		if (!statusWasUpdated || !studentId) return;

		const studentRepository = event.manager.getRepository(Student);
		const student = await studentRepository.findOne({
			where: { id: studentId },
			relations: ["enrollments"],
		});

		if (!student) return;

		const isLatestEnrollment = this.isLatestEnrollment(student.enrollments, event.entity?.id);

		if (isLatestEnrollment && student.status !== event.entity?.status) {
			student.status = event.entity?.status;
			await event.manager.save(student);
		}
	}

	private isLatestEnrollment(enrollments: Enrollment[], currentEnrollmentId: bigint): boolean {
		if (!enrollments.length) return false;

		const sortedEnrollments = [...enrollments].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		return sortedEnrollments[0]?.id === BigInt(currentEnrollmentId);
	}
}
