import {AppDataSource} from "../database/data-source";
import {NextOfKin} from "../database/entities/NextOfKin.entity";
import {CreateNextOfKinDTO, UpdateNextOfKinDTO} from "../@types.global/dtos";
import {Student} from "../database/entities/Students.entity";

export class NextOfKinService {
    get repo() {
        return AppDataSource.getRepository(NextOfKin)
    }

    async create(payload: Partial<CreateNextOfKinDTO>, student: Student) {
        // check student has lass than 2 next of kins
        const count = await this.repo.countBy({student: student})
        if (count > 2)
            throw new Error("Each student is only allowed to have a maximum of 2 next of kins")
        const created = this.repo.create({...payload, student: student});
        return this.repo.save(created)
    }

    async update(payload: Partial<UpdateNextOfKinDTO>) {
        // find it
        const found = await this.repo.findOneBy({id: payload.id})
        if (!found)
            throw new Error("Next of kin not found")
        Object.assign(found, payload)
        await this.repo.save(payload)
        return this.repo.findOneBy({id: payload.id})
    }
}
