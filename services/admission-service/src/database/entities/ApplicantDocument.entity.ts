import {Cascade, Entity, PrimaryKey, Property} from "@mikro-orm/core";
import {Applicants} from "./Applicants.entity";
import {OneToOne} from "@mikro-orm/postgresql";

@Entity()
export class ApplicantDocuments {

    @PrimaryKey({type: "bigint"})
    id!: number;

    @Property({nullable: true})
    kcseCertificate!: string | null; // counts

    @Property({nullable: true})
    kcpeCertificate!: string | null; // counts

    @Property({nullable: true})
    birthCertificate!: string | null;

    @Property({nullable: true})
    nationalId!: string | null; // counts

    @Property({nullable: true})
    passportPhoto!: string | null; // counts

    @Property({nullable: true})
    tertiaryCertificate!: string | null; // counts if they went to tertiary

    @OneToOne({
        entity: () => Applicants,
        owner: true,
        cascade: [Cascade.ALL],
        nullable: true,
        orphanRemoval: true,
        hidden: true,
    })
    applicant!: Applicants;
}

