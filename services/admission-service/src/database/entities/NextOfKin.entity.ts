import {BeforeCreate, BeforeUpdate, Cascade, Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {Applicants} from "./Applicants.entity";
import {Opt} from "@mikro-orm/postgresql";

@Entity()
export class NextOfKin {
    @PrimaryKey()
    id!: bigint;

    @Property({nullable: true})
    firstName?: string & Opt;

    @Property({nullable: true})
    lastName?: string & Opt;

    @Property({nullable: true})
    phone?: string;

    @Property()
    email?: string;

    @Property({nullable: true})
    relationship?: string & Opt;

    @ManyToOne({
        entity: () => Applicants,
        inversedBy: "nextOfKins",
        cascade: [Cascade.PERSIST],
        deleteRule: 'cascade',
        nullable: false,
        hidden: true
    })
    applicant!: Applicants;

    @BeforeCreate()
    @BeforeUpdate()
    validate() {
        for (const key in this) {
            const val = this[key];
            if (typeof val === "string" && val.trim() === "") {
                if (["email", "phone", "relationship", "firstName", "lastName"].includes(key)) {
                    //@ts-ignore
                    this[key] = undefined;
                }
            }
        }
    }

    constructor(kin?: Applicants) {
        if (kin) this.applicant = kin
    }
}
