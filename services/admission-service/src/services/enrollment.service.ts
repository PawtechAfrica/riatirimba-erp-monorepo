import {ModelServiceFw} from "./ModelServiceFw";
import {Enrollment} from "../database/entities/Enrollment.entity";
import {validateDTO} from "../utils/validateDTO";
import {UpdateEnrollmentDTO} from "../types/DTOs/enrollment.dto";
import {AppError} from "../utils/bootstrappers";
import {Intake} from "../database/entities/Intake.entity";

type x = 'firstName'

export class EnrollmentService extends ModelServiceFw<Enrollment> {
    entity = Enrollment;
    baseFields = ['newApplicant', 'course', 'intake', 'studentType'] as (keyof Enrollment)[];

    async getExtraFields(entity: Enrollment): Promise<(keyof Enrollment)[]> {
        if (!entity.newApplicant)
            return ['admissionNumber']
        return []
    }

    async update(data: any, userId?: string): Promise<Enrollment> {
        // validate the data
        if (!this.repo || !this.em)
            throw new AppError('Unable to update enrollment at this time! Please try again later!', 500);
        const {id, ...validated} = await validateDTO(UpdateEnrollmentDTO, data)
        // find the enrollment to update
        let found: undefined | null | Enrollment;
        found = await this.repo.findOne(id)
        if (!found) {
            if (!userId)
                throw new AppError("Please create the enrollment first!")
            // create the enrollment for the student
            found = new Enrollment()
            this.repo.assign(found, data)
        }
        const intake = await this.em.findOne(Intake, {periodYearKey: validated.intake})
        this.repo.assign(found, {...validated, intake: intake})
        await this.em.persistAndFlush(found)
        return found;
    }

}

