import {ModelServiceFw} from "./ModelServiceFw";
import {NextOfKin} from "../database/entities/NextOfKin.entity";
import {AppError} from "../utils/bootstrappers";
import {CreateNextOfKinDTO, UpdateNextOfKinDTO} from "../types/DTOs/nextOfKin.dto";
import {validateDTO} from "../utils/validateDTO";
import {applicantService, nextOfKinService} from "./index";
import {Applicants} from "../database/entities/Applicants.entity";


export class NextOfKinsService extends ModelServiceFw<NextOfKin> {
    entity = NextOfKin
    baseFields = ['firstName', 'lastName', 'phone', 'relationship'] satisfies (keyof NextOfKin)[]

    async deleteNextOfKin(id: string) {
        const found = await this.repo?.findOne({id})
        if (!found)
            throw new AppError("Next of kin not found!")
        await this.em.remove(found).flush()
        return found;
    }

    async createMultiple(data: (CreateNextOfKinDTO | UpdateNextOfKinDTO)[], applicantId: Applicants | string) {
        if (!this.repo)
            throw new AppError("Unable to create next of kin at this time!")
        if (data.length > 2)
            throw new AppError("You can only create 2 next of kins at a time!")
        return this.repo.upsertMany(data.map(
                ({applicant, ...nok}) =>
                    ({
                        ...nok,
                        // provide a kin field if it is a new applicant
                        ...('id' in nok ? {} : {applicant: applicant ?? applicantId})
                    })
            ), {onConflictFields: ['id']}
        )
    }

    async updateNextOfKins(data: any, userId: string) {
        if (!this.em || !this.repo)
            throw new AppError("Unable to update next of kins at this time!")
        // validate data
        if (!Array.isArray(data) || data.length > 2)
            throw new AppError("You can only register a maximum of 2 next of kins!")
        if (data.length === 0)
            throw new AppError("You must register at least one next of kin!")

        const validArray: UpdateNextOfKinDTO[] = []
        for (const item of data) {
            const validated = await validateDTO(UpdateNextOfKinDTO, item)
            validArray.push(validated)
        }
        // count nextOfKins for this student
        const [found, count] = await nextOfKinService.repo?.findAndCount({applicant: userId}) ?? [[], 0]
        if (count > 2) {
            // delete the extra
            const toBeDeleted = found.splice(2)
            this.em.remove(toBeDeleted)
        }
        // if the list is empty, blindly create
        if (count === 0) {
            const applicant = applicantService.repo?.getReference(userId)
            if (!applicant) return
            return this.createMultiple(validArray, userId)
        }
        // upsert many, if it exists, it updates, if it doesn't, it creates
        return nextOfKinService.repo?.upsertMany(validArray.map(nok => ({...nok, applicant: userId})),
            {onConflictFields: ['id']}
        )
    }
}

