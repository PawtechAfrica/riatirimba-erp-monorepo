import type { ApplicantRecords } from '../entities/applicants.entity';
import { GenderEnum } from '../../../libs/@types/global.types';

export class GenApplicantsFilterDto {
    readonly intakes: string[];
    readonly courses: string[];
    readonly gender: GenderEnum | null;
    readonly newApplicant: '1' | '' | null;
    readonly approved: '1' | '' | null;
}
export class GenApplicantsDto {
    readonly fields: (keyof typeof ApplicantRecords)[];
    readonly idList: string[];
    readonly filters: GenApplicantsFilterDto;
    readonly name: string;
}
