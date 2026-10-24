import { Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { GenderEnum, GradeEnum } from "../../types";
import { Intake } from "./Intake.entity";


@Entity()
export class AdmissionStats {
    [key: string]: { [key: string]: number | string | GradeEnum | GenderEnum } | Intake | number;

    @PrimaryKey({ type: 'bigint' })
    id!: number;

    @OneToOne({ entity: () => Intake })
    intake!: Intake;

    @Property({ type: 'jsonb' })
    applicantsCount: { [key: string]: 1 } = {};
    @Property({ type: 'jsonb' })
    genderCount: { [key: string]: GenderEnum } = {};
    @Property({ type: 'jsonb' })
    acceptanceByGender: { [key: string]: GenderEnum } = {};
    @Property({ type: 'jsonb' })
    applicantGrades: { [key: string]: string } = {};
    @Property({ type: 'jsonb' })
    completeApplications: { [key: string]: 1 } = {};
    @Property({ type: 'jsonb' })
    courses: { [key: string]: number } = {};
    @Property({ type: 'jsonb' })
    ages: { [key: string]: number } = {};
    @Property({ type: 'jsonb' })
    migrationCount: { [key: string]: number } = {};

    @Property({ default: 0 })
    get totalAccepted() {
        try {
            return Object.values(this.acceptanceByGender).length;
        } catch (err) {
            return 0;
        }
    }

    @Property({ default: 0 })
    get acceptanceScore() {
        try {
            const value = Math.floor((this.totalAccepted / Object.keys(this.applicantsCount).length) * 100)
            return Number.isNaN(value) ? 0 : value;
        } catch (err) {
            return 0;
        }
    }
}
