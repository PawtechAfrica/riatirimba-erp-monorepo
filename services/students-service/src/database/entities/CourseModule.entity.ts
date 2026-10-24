import {
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	ManyToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { Enrollment } from "./Enrollment.entity";
import { TermSession } from "./TermSession.entity";

export enum ModuleStatusEnum {
	COMPLETED = "COMPLETED",
	IN_PROGRESS = "IN_PROGRESS",
}

@Entity()
@Index(["enrollment", "moduleNumber"])
export class CourseModule {
	@PrimaryColumn("uuid")
	id!: string;

	// There are 3 terms in a year
	@Column({ type: "int", nullable: false })
	termNumber!: number;

	@Column({ type: "int", nullable: false })
	courseId!: number;

	@Column({ type: "smallint", nullable: false })
	moduleNumber!: number;

	@ManyToOne(() => Enrollment, { nullable: false })
	enrollment!: Enrollment;

	@Column({ type: "smallint", nullable: false, default: 1 })
	academicYear!: number;

	@Column({ type: "enum", nullable: true, enum: ModuleStatusEnum, default: ModuleStatusEnum.IN_PROGRESS })
	status?: ModuleStatusEnum | null;

	@Column({ type: "date", nullable: true, default: null })
	completedAt?: Date | null;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "varchar" })
	enroller!: string;

	@ManyToOne(() => TermSession, (session) => session.modules)
	session!: TermSession;

	@BeforeInsert()
	beforeInsert() {
		this.id = uuidv7();
	}
}
