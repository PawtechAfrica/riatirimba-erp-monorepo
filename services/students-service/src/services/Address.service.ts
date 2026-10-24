import {AppDataSource} from "../database/data-source";
import {Address} from "../database/entities/Adress.entity";
import {CreateAddressDto, UpdateAddressDto} from "../@types.global/dtos";
import {Student} from "../database/entities/Students.entity";
import {AppError} from "../utils/AppErrorClasses";

export class AddressService {
    get repo() {
        return AppDataSource.getRepository(Address)
    }

    createAddress(payload: CreateAddressDto, student: Student) {
        return this.repo.manager.transaction(async (em) => {
            const created = em.create(Address, {...payload, student: student})
            return em.save(created)
        })
    }

    async update(id: number, payload: UpdateAddressDto) {
        const found = await this.repo.findOneBy({id: Number(id)})
        if (!found) throw new AppError("No address found with this id!", 404)
        await this.repo.update(id, payload)
        return this.repo.findOneBy({id: Number(id)})
    }

}

