import { UpdateAcademicHistoryDto } from "../@types.global/dtos";
import { Student } from "../database/entities/Students.entity";
import { AppDataSource } from "../database/data-source";
import { AcademicHistory } from "../database/entities/AcademicHistory.entity";
import { AppError } from "../utils/AppErrorClasses";

export class AcademicHistoryService {
    get repo() {
        return AppDataSource.getRepository(AcademicHistory);
    }

    // todo: Modify this method
    async createAcademicHistory(payload: UpdateAcademicHistoryDto) {
        const newRecord = this.repo.create(payload);
        return await this.repo.save(newRecord);
    }

    async updateAcademicHistory(id: number, payload: UpdateAcademicHistoryDto) {
        const found = await this.repo.findOneBy({ id });
        // should not happen
        if (!found) throw new AppError("Academic history record not found! Please contact support!");
        return await this.repo.update(found.id, payload);
    }

    async getAcademicHistory(id: number) {
        const found = await this.repo.findOneBy({ id });
        if (!found) throw new AppError("Academic history record not found! Please contact support!");
        return found;
    }
}
