// src/entities/Intake.ts

import {BeforeCreate, BeforeUpdate, BeforeUpsert, Entity, Enum, OnLoad, PrimaryKey, Property,} from "@mikro-orm/core";
import dayjs from "dayjs";
import {IntakePeriodEnum} from "../../types";
import type {CreateIntakeDTO} from "../../types/DTOs";

export enum IntakeStatus {
    UPCOMING = "upcoming",
    OPEN = "open",
    CLOSED = "closed",
    OVERDUE = "overdue",
}

@Entity()
export class Intake {
    @Property({autoincrement: true, type: 'bigint'})
    id!: number;

    @Property({nullable: true})
    opens?: Date;

    @Property({nullable: true})
    closes?: Date;

    @Enum({items: () => IntakePeriodEnum, nullable: true})
    period!: IntakePeriodEnum;

    @Property({nullable: true})
    year!: number;

    @PrimaryKey({unique: true, type: 'varchar'})
    periodYearKey!: string;

    @Enum({items: () => IntakeStatus, default: IntakeStatus.OPEN, persist: true})
    status: IntakeStatus = IntakeStatus.OPEN;

    @Property({default: false})
    closed?: boolean;

    @Property({type: "date", defaultRaw: "CURRENT_TIMESTAMP"})
    createdAt: Date = new Date();

    @Property({onUpdate: () => new Date(), defaultRaw: "CURRENT_TIMESTAMP"})
    updatedAt: Date = new Date();


    @OnLoad()
    @BeforeUpdate()
    run() {
        if (!this.period) {
            const om = dayjs(this.opens).format("MMM");
            this.period =
                om === "Jan"
                    ? IntakePeriodEnum.JANUARY_INTAKE
                    : om === "May"
                        ? IntakePeriodEnum.MAY_INTAKE
                        : IntakePeriodEnum.SEPTEMBER_INTAKE;
        }
    }

    @BeforeCreate()
    @BeforeUpsert()
    onCreate() {
        this.periodYearKey = `${this.period}-${this.year}`;
    }

    @Property({persist: false})
    get readable(): string {
        // const name = dayjs(this.opens).isValid() ? dayjs(this.opens).format("MMMM YYYY") : this.periodYearKey;
        const periodMonths: Record<IntakePeriodEnum, string> = {
            [IntakePeriodEnum.JANUARY_INTAKE]: "January intake",
            [IntakePeriodEnum.MAY_INTAKE]: "May intake",
            [IntakePeriodEnum.SEPTEMBER_INTAKE]: "September intake"
        };
        return `${periodMonths[this.period]} ${this.year}`
    }

    constructor(data?: CreateIntakeDTO) {
        if (!data) return

        this.period =
            data.period.toLowerCase() === "jan"
                ? IntakePeriodEnum.JANUARY_INTAKE
                : data.period.toLowerCase() === "may"
                    ? IntakePeriodEnum.MAY_INTAKE
                    : IntakePeriodEnum.SEPTEMBER_INTAKE;
        if (data.year) this.year = data.year;
        if (data.opens) this.opens = new Date(data.opens);
        if (data.closes) this.closes = new Date(data.closes);
    }
}
