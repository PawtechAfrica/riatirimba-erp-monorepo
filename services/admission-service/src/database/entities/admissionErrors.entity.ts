import {Entity, OneToOne, PrimaryKey, Property, RequiredNullable} from "@mikro-orm/core";
import {Applicants} from "./Applicants.entity";
import {Cascade} from "@mikro-orm/postgresql";

@Entity()
export class AdmissionErrors {
    @PrimaryKey({type: 'integer', autoincrement: true})
    id!: number;

    @Property({type: 'jsonb', nullable: true, default: []})
    errors!: { property: string, message: string }[];

    @Property({type: 'date', onUpdate: () => new Date(), nullable: true})
    updatedAt?: RequiredNullable<Date>;
    @Property({type: 'date', defaultRaw: 'CURRENT_TIMESTAMP', nullable: true, hidden: true})
    createdAt?: RequiredNullable<Date>;

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

