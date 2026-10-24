import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {NextOfKinObj} from "../@types.database";
import {Student} from "./Students.entity";

@Entity()
export class NextOfKin {
    @PrimaryGeneratedColumn("increment", {type: "bigint"})
    id!: string;
    @Column({type: "varchar", length: 100})
    firstName!: string;
    @Column({type: "varchar", length: 100})
    lastName!: string;
    @Column({type: "varchar", nullable: true})
    email?: string;
    @Column({type: "varchar", length: 20})
    phone!: string;
    @Column({type: "varchar", length: 50})
    relationship!: string;

    // ✅ Deleting NextOfKin will set student reference to null (SET NULL)
    @ManyToOne(() => Student, (student) => student.nextOfKins, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false
    })
    @JoinColumn({name: "student_id"})
    student!: Student | null;

    constructor(data?: NextOfKinObj) {
        if (data) {
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.phone = data.phone;
            this.relationship = data.relationship;
            this.student = data.student;
            if (data.email) {
                this.email = data.email;
            }
        }
    }
}
