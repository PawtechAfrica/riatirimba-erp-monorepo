import {
    BaseEntity,
    Cascade,
    Collection,
    Entity,
    Enum,
    Filter,
    OneToMany,
    OneToOne,
    Opt,
    PrimaryKey,
    Property,
} from "@mikro-orm/postgresql";
import { v4 } from "uuid";
import { GenderEnum, IdTypeEnum, } from "../../types";
import { Address } from "./Address.entity";
import { NextOfKin } from "./NextOfKin.entity";
import { AcademicHistory } from "./AcademicHistory.entity";
import { Enrollment } from "./Enrollment.entity";
import dayjs from "dayjs";
import { ApplicantDocuments } from "./ApplicantDocument.entity";
import { Index, RequiredNullable } from "@mikro-orm/core";
import { AdmissionErrors } from "./admissionErrors.entity";

@Index({
    name: "idx_applicant_full_name_trgm",
    expression: 'CREATE INDEX IF NOT EXISTS idx_applicant_full_name_trgm ON applicants USING gin ((coalesce(first_name, \'\') || \' \' || coalesce(middle_name, \'\') || \' \' || coalesce(last_name, \'\')) gin_trgm_ops)'
})
@Filter({ name: "softDeleted", cond: { deleted: { $ne: true } }, default: true })
@Entity()
export class Applicants extends BaseEntity {
    @PrimaryKey()
    id: string = v4();

    @Property({ hidden: true })
    createdAt: Date & Opt = new Date();

    @Property({ onUpdate: () => new Date(), hidden: true })
    updatedAt: Date & Opt = new Date();

    @Property()
    firstName!: string;

    @Property({ nullable: true })
    middleName?: string;

    @Property()
    lastName!: string;

    @Property({ unique: true })
    email!: string;

    @Property({ unique: true, nullable: true })
    // @Check({expression: "phone ~ '^\\+[1-9][0-9]{0,2}[0-9\\s\\-()]{6,15}$'"})
    phone?: string;

    // @deprecated todo: remove in the next iteration
    @Enum({ items: () => IdTypeEnum, nullable: true })
    idType?: IdTypeEnum;

    // @deprecated todo: remove in the next iteration
    @Property({ nullable: true, unique: true })
    idNumber?: string;

    @Property({ nullable: true, unique: true })
    birthCertNumber?: string;

    @Property({ nullable: true, unique: true })
    nationalId?: string;

    @Enum({ items: () => GenderEnum, nullable: true })
    gender?: GenderEnum;

    @Property({ nullable: true, hidden: true })
    birthDay?: RequiredNullable<Date>;

    @Property({ type: "varchar", length: 100, nullable: true })
    pinNumber?: string;

    @Property({ persist: false })
    get dateOfBirth(): (string & Opt) | null {
        return dayjs(this.birthDay).isValid() ? dayjs(this.birthDay).format("D MMMM YYYY") : null
    }

    set dateOfBirth(value: ((string | Date) & Opt) | null) {
        this.birthDay = value && dayjs(value).isValid() ? new Date(value) : null
    }

    @Property({ persist: false })
    get age(): number & Opt {
        return dayjs().diff(this.birthDay, 'years')
    }

    @Property({ type: "boolean", default: false })
    pending: boolean & Opt = false;

    @Property({ type: "boolean", default: false })
    migrated: boolean & Opt = false;

    @OneToOne({
        entity: () => ApplicantDocuments,
        eager: true,
        mappedBy: "applicant",
    })
    documents!: ApplicantDocuments & Opt;

    // Address - enable eager loading
    @OneToOne({
        entity: () => Address,
        eager: true, // Load address automatically
        mappedBy: "applicant",
    })
    address!: Address & Opt;

    @OneToOne({
        entity: () => AcademicHistory,
        eager: true,
        mappedBy: "applicant",
    })
    academicHistory!: AcademicHistory & Opt;

    @OneToOne({
        entity: () => Enrollment,
        eager: true,
        mappedBy: "applicant",
    })
    enrollments!: Enrollment & Opt;

    @OneToMany({ entity: () => NextOfKin, mappedBy: "applicant", eager: true })
    nextOfKins: Collection<NextOfKin> & Opt = new Collection<NextOfKin>(this);

    @Property({ type: "int", nullable: true })
    completionStatus: number & Opt = 0;

    @Property({ type: "boolean", default: false, hidden: true })
    deleted: boolean & Opt = false;

    @Property({ type: "boolean", default: false })
    submitted: boolean & Opt = false;

    @OneToOne({
        entity: () => AdmissionErrors,
        eager: true,
        mappedBy: "applicant",
    })
    admissionErrors: Opt<AdmissionErrors> = new AdmissionErrors()
}