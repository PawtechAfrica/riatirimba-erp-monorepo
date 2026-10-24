import { Cascade, Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/postgresql";
import { Applicants } from "./Applicants.entity";

@Entity()
export class Address {

    @PrimaryKey({ type: "bigint" })
    id!: number;
    @Property({ type: 'int', nullable: true })
    zipCode?: number
    @Property({ type: 'int', nullable: true })
    poBox?: number;
    @Property({ nullable: true })
    county?: string;
    @Property({ nullable: true })
    location?: string;
    @Property({ nullable: true })
    subLocation?: string;
    @Property({ nullable: true })
    village?: string;

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
