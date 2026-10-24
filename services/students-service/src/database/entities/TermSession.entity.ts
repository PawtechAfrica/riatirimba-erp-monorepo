import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import snowFlake from "../../utils/sonyflake.utils";
import { CourseModule } from "./CourseModule.entity";

export enum SessionPeriod {
	JAN_APR = "jan-apr",
	MAY_AUG = "may-aug",
	SEP_DEC = "sep-dec",
}

export function getCurrentSessionPeriod(): SessionPeriod {
	const currentMonth = new Date().getMonth();
	if (currentMonth >= 0 && currentMonth <= 3) return SessionPeriod.JAN_APR;
	if (currentMonth >= 4 && currentMonth <= 7) return SessionPeriod.MAY_AUG;
	return SessionPeriod.SEP_DEC;
}

@Entity()
export class TermSession {
	@PrimaryColumn({ type: "bigint" })
	id!: string;

	@Column({ type: "enum", enum: SessionPeriod })
	period!: SessionPeriod;

	@Column({ type: "date" })
	startDate!: Date;

	@Column({ type: "date", nullable: true, default: null })
	endDate!: Date | null;

	@Column({ type: "smallint" })
	year!: number;

	@OneToMany(() => CourseModule, (courseModule) => courseModule.session, { cascade: ["insert", "update"] })
	modules!: CourseModule[];

	@BeforeInsert()
	beforeInsert() {
		if (!this.id) this.id = snowFlake.genId();
		if (!this.period) this.period = getCurrentSessionPeriod();
		if (!this.year) this.year = new Date(this.startDate).getFullYear();
	}
}
