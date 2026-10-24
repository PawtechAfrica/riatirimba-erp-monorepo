import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {v7 as uuidV7} from "uuid";
import {GenderEnum, IdTypeEnum, EnrollmentStatusEnum} from "../@types.database";
import dayjs from "dayjs";
import {AppError} from "../../utils/AppErrorClasses";
import {AcademicHistory} from "./AcademicHistory.entity";
import {Address} from "./Adress.entity";
import {Enrollment} from "./Enrollment.entity";
import {NextOfKin} from "./NextOfKin.entity";
import {StudentDocument} from "./StudentDocument.entity";

@Entity()
export class Student {
    @PrimaryGeneratedColumn("uuid")
    id: string = uuidV7();
    @Column()
    firstName!: string;
    @Column({nullable: true})
    middleName?: string;
    @Column()
    lastName!: string;
    @Column({unique: true})
    email!: string;
    @Column({unique: true})
    phone!: string;
    // @deprecated todo: Remove in the next iteration
    @Column({
        type: "enum",
        enum: IdTypeEnum,
        nullable: true
    })
    idType!: IdTypeEnum;
    // @deprecated todo: Remove in the next iteration
    @Column({unique: false, nullable: true})
    idNumber?: string;

    // todo: Enforce required
    @Column({unique: true, nullable: true})
    birthCertNumber!: string;

    @Column({unique: true, nullable: true})
    nationalId?: string;

    @Column({
        type: "enum",
        enum: GenderEnum,
    })
    gender!: GenderEnum;
    @Column({type: "date", select: false, nullable: true})
    birthday!: Date;

    get dateOfBirth(): string {
        return dayjs(this.birthday).format("D MMMM YYYY");
    }

    set dateOfBirth(date: string) {
        if (!dayjs(date).isValid()) throw new AppError("Invalid date value!");
        this.birthday = dayjs(date).toDate();
    }

    get age(): number | null {
        return this.birthday ? dayjs().diff(this.birthday, "years") : null;
    }

    @Column({type: "varchar", nullable: true, unique: false})
    nemisCode?: string | null;

    @Column({type: "enum", enum: EnrollmentStatusEnum, default: EnrollmentStatusEnum.ACTIVE})
    status!: EnrollmentStatusEnum;

    @Column({type: "varchar", length: 100, nullable: true})
    pinNumber?: string;

    @Column({default: false, nullable: true, select: false})
    deleted!: boolean;
    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn({name: "updated_at", select: false})
    updatedAt!: Date;


    // ✅ One-to-one: Delete Address when Student is deleted.
    @OneToOne(() => Address, (address) => address.student, {
        cascade: true,
        eager: true,
    })
    address!: Address;

    // ✅ One-to-many: Delete NextOfKins when Student is deleted
    @OneToMany(() => NextOfKin, (nOk) => nOk.student, {
        cascade: true,
    })
	nextOfKins!: NextOfKin[];

    // ✅ One-to-one: Delete AcademicHistory when a Student is deleted
    @OneToOne(() => AcademicHistory, (ah) => ah.student, {
        cascade: true,
        eager: true,
        orphanedRowAction: "delete",
    })
    academicHistory!: AcademicHistory;

    // ✅ One-to-many: Delete Enrollments when Student is deleted
    @OneToMany(() => Enrollment, (entity) => entity.student, {
        cascade: true,
        orphanedRowAction: "delete",
    })
    enrollments!: Enrollment[];

    // ✅ One-to-many: Delete Documents when Student is deleted
    @OneToMany(() => StudentDocument, (doc) => doc.owner, {
        cascade: true,
        orphanedRowAction: "delete",
    })
    documents!: StudentDocument[];
}
