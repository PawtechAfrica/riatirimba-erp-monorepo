import {RequestContext} from "@mikro-orm/core";
import {OneIntakeStatResponseDTO} from "../types/DTOs/stats.dto";
import {Intake} from "../database/entities/Intake.entity";
import {Enrollment} from "../database/entities/Enrollment.entity";
import {GenderEnum} from "../types";

export class StatsService {
    get em() {
        return RequestContext.getEntityManager()
    }

    defaultOneIntakeStat = {
        monthYear: "",
        applicants: {M: 0, F: 0, unspecified: 0},
        total: 0,
        admitted: 0,
        acceptanceRate: 0
    } satisfies OneIntakeStatResponseDTO

    async oneIntakeStats(intake_key: string): Promise<OneIntakeStatResponseDTO> {
        if (!this.em) return this.defaultOneIntakeStat
        // find the intake
        const intake = await this.em.findOne(Intake, {periodYearKey: intake_key})
        if (!intake) return this.defaultOneIntakeStat
        const [enrollments, total] = await this.em.findAndCount(Enrollment, {intake: intake}, {populate: ['applicant']})
        // find gender distribution
        let F = 0, M = 0, accepted = 0
        for (const applicant of enrollments) {
            applicant.applicant.gender === GenderEnum.FEMALE
                ? F += 1
                : applicant.applicant.gender === GenderEnum.MALE
                    ? M += 1 : {};
            if (applicant.applicant.pending)
                accepted += 1
        }

        return {
            acceptanceRate: accepted > 0 ? ((accepted / total) * 100) : 0,
            applicants: {M, F, unspecified: (total - M + F)},
            admitted: accepted,
            total: total,
            monthYear: intake.periodYearKey
        }
    }
}