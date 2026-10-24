import {BasicEducationEnum, GradeEnum, TertiaryLevel} from "../../types";
import {Entity, Enum, OneToOne, Opt, PrimaryKey, Property} from "@mikro-orm/core";
import {Applicants} from "./Applicants.entity";
import {Cascade} from "@mikro-orm/postgresql";


@Entity()
export class AcademicHistory {
    @PrimaryKey({type: "int", autoincrement: true})
    id!: number;

    @Enum({items: () => BasicEducationEnum, nullable: true})
    highestEducationLevel?: BasicEducationEnum | null;

    //check: '"kcseIndexNumber" ~ \'^\\\\d{11}/\\\\d{4}$\''
    @Property({nullable: true, unique: true})
    kcseIndexNumber?: string & Opt;

    // check: '"kcpeIndexNumber" ~ \'^\\\\d{11}/\\\\d{4}$\''}
    @Property({nullable: false, unique: true})
    kcpeIndexNumber!: string;

    @Property({nullable: true})
    primarySchool?: string & Opt;

    @Property({nullable: true})
    highSchool?: string & Opt;

    @Enum({items: () => TertiaryLevel, nullable: true})
    tertiaryLevel!: TertiaryLevel & Opt;

    @Property({nullable: true})
    tertiarySchool?: string & Opt;

    @Enum({items: () => GradeEnum, nullable: true})
    kcseGrade?: GradeEnum & Opt;


    @OneToOne({
        entity: () => Applicants,
        owner: true,
        cascade: [Cascade.ALL],
        nullable: true,
        orphanRemoval: true,
        hidden: true,
    })
    applicant!: Applicants & Opt;
}
