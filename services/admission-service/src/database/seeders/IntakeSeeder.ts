import {EntityManager} from '@mikro-orm/core';
import {Seeder} from '@mikro-orm/seeder';
import dayjs from 'dayjs';
import {Intake} from "../entities/Intake.entity";
import {IntakePeriodEnum} from "../../types";

export class IntakeSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const startYear = 2025;
        const endYear = 2021;
        const intakePeriods = [IntakePeriodEnum.JANUARY_INTAKE, IntakePeriodEnum.MAY_INTAKE, IntakePeriodEnum.SEPTEMBER_INTAKE]; // January, May, September (0-based months)

        for (let year = startYear; year >= endYear; year--) {
            for (const period of intakePeriods) {
                const key = `${period}-${year}`;
                const existing = await em.findOne(Intake, { periodYearKey: key });
                if (!existing) {
                    const opens = dayjs(`1 ${period} ${year}`).toDate();
                    const closes = dayjs(opens).add(1, 'month').toDate();
                    const created = new Intake({period, year, opens, closes});
                    await em.persistAndFlush(created);
                }
            }
        }
    }
}