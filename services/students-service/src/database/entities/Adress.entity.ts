import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Student} from "./Students.entity";

@Entity()
export class Address {
    @PrimaryGeneratedColumn("increment", {type: "bigint"})
    id!: number;
    @Column({type: "int", nullable: true})
    poBox?: number | null;
    @Column({type: "int", nullable: true})
    zipCode?: number | null;
    @Column({type: "varchar", nullable: true, default: null})
    county?: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    location?: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    subLocation?: string | null;
    @Column({type: "varchar", nullable: true, default: null})
    village?: string | null;

    // ✅ Deleting Address will set student reference to null (SET NULL)
    @OneToOne(() => Student, (student) => student.address, {
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
        nullable: false
    })
    @JoinColumn({name: "student_id"})
    student?: Student | null;

    constructor(addressObject?: Address) {
        if (addressObject) {
            Object.assign(this, addressObject);
        }
    }
}
