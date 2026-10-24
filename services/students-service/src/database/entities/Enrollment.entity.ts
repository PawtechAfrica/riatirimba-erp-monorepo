import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { ExamBody, EnrollmentStatusEnum, StudentTypeEnum } from "../@types.database";
import { CourseModule } from "./CourseModule.entity";
import { Student } from "./Students.entity";

/*
Enrollment here refers to a course enrollment
*/
@Entity()
export class Enrollment {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id!: bigint;
	@Column({ type: "int" })
	course!: number; // course id
	@Column({ type: "uuid", nullable: true })
	department?: string;
	@CreateDateColumn({ name: "created_at", select: false })
	admissionDate!: Date;
	@Column({ type: "smallint", default: 1 })
	yearOfStudy!: number; // todo: figure out how to track yearOfStudy

	@Column({ type: "boolean", default: true })
	newApplicant!: boolean;
	@Column({ type: "enum", enum: ExamBody, nullable: true, default: ExamBody.CDACC })
	examiningBody!: ExamBody;
	@Column()
	@Index()
	intake!: string;

	@Column({ unique: true })
	admissionNumber!: string; // admission number

	@Column({
		type: "enum",
		enum: StudentTypeEnum,
		default: StudentTypeEnum.KUCCPS__GOVT_SPONSORED,
	})
	studentType!: StudentTypeEnum;
	@Column({ type: "enum", nullable: true, enum: EnrollmentStatusEnum, default: EnrollmentStatusEnum.ACTIVE })
	status?: EnrollmentStatusEnum;

	// ✅ Deleting Enrollment will set student reference to null (SET NULL)
	@ManyToOne(() => Student, (entity) => entity.enrollments, {
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
		nullable: false,
	})
	@JoinColumn({ name: "student_id" })
	student?: Student;

	@OneToMany(() => CourseModule, (term) => term.enrollment, { eager: true })
	modules!: CourseModule[];

	@CreateDateColumn()
	createdAt!: Date;
}
