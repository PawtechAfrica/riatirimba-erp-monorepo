import {Entity, Enum, Index, ManyToOne, OneToOne, PrimaryKey, Property, RequiredNullable} from "@mikro-orm/core";
import {Intake} from "./Intake.entity";
import {ExamBodyEnum, StudentTypeEnum} from "../../types";
import {Cascade, Opt} from "@mikro-orm/postgresql";
import {Applicants} from "./Applicants.entity";

@Entity()
export class Enrollment {
    @PrimaryKey({type: "int", autoincrement: true})
    id!: number;

    @Property({type: "int", nullable: true})
    course!: number & Opt;

    @Index()
    @ManyToOne({entity: () => Intake, nullable: true})
    intake!: Intake & Opt;

    @Property({type: "boolean", default: true})
    newApplicant!: boolean & Opt;

    @Property({unique: true, nullable: true})
    admissionNumber!: string & Opt;

    @Property({nullable: true})
    yearOfStudy!: number & Opt;

    @Enum({items: () => ExamBodyEnum, default: ExamBodyEnum.CDACC, nullable: true})
    examiningBody!: RequiredNullable<ExamBodyEnum> & Opt;

    @Enum({
        items: () => StudentTypeEnum,
        // default: StudentTypeEnum.KUCCPS__GOVT_SPONSORED,
        nullable: true,
    })
    studentType!: StudentTypeEnum & Opt;

    @Property({type: "date", hidden: true, index: true, defaultRaw: "CURRENT_TIMESTAMP"})
    createdAt!: Date & Opt;

    @OneToOne({
        entity: () => Applicants,
        owner: true,
        cascade: [Cascade.ALL],
        nullable: false,
        orphanRemoval: true,
        hidden: true,
    })
    applicant!: Applicants;
}
