import {ModelServiceFw} from "./ModelServiceFw";
import {AcademicHistory} from "../database/entities/AcademicHistory.entity";
import {validateDTO} from "../utils/validateDTO";
import {UpdateAcademicHistoryDTO} from "../types/DTOs/academicHistory.dto";
import {AppError} from "../utils/bootstrappers";
import {BasicEducationEnum} from "../types";


export class AcademicHistoryService extends ModelServiceFw<AcademicHistory> {
    entity = AcademicHistory;
    baseFields = ['highestEducationLevel', 'primarySchool', 'kcpeIndexNumber'] satisfies (keyof AcademicHistory)[];

    async getExtraFields(entity: AcademicHistory): Promise<(keyof AcademicHistory)[]> {
        if (entity.highestEducationLevel == BasicEducationEnum.HIGH_SCHOOL)
            return ['kcseIndexNumber', 'kcseGrade', 'highSchool'];
        if (entity.highestEducationLevel == 'tertiary')
            return ['kcseIndexNumber', 'kcseGrade', 'highSchool', 'tertiarySchool', 'tertiaryLevel']
        return [];
    }

    async update(data: any) {
        if (!this.repo || !this.em)
            throw new AppError("Unable to update academic history at this time!");
        // validate
        const validated = await validateDTO(UpdateAcademicHistoryDTO, data);
        return await this.repo.upsert(validated, {onConflictFields: ['id']})
    }
}

