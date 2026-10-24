import {Check, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {AcademicHistoryObj, EducationLevelEnum, GradeEnum, TertiaryLevel} from "../@types.database";
import {Student} from "./Students.entity";

@Entity()
@Check("kcse_index_check", `"kcseIndexNumber" ~ '^(?:\\\\d{11}|\\\\d{9})\\\\/\\\\d{4}$'`)
@Check("kcpe_index_check", `"kcpeIndexNumber" ~ '^(?:\\\\d{11}|\\\\d{9})\\\\/\\\\d{4}$'`)
export class AcademicHistory {
    @PrimaryGeneratedColumn("increment")
    id!: number;
    @Column({type: "enum", enum: EducationLevelEnum, nullable: true})
    highestEducationLevel!: EducationLevelEnum | null;

	@Column({ nullable: true, unique: true, type: "varchar" })
	kcseIndexNumber?: string;

    @Column({nullable: false, unique: true})
    kcpeIndexNumber!: string;
    @Column({nullable: true})
    primarySchool?: string;
    @Column({nullable: true})
    highSchool?: string;
    @Column({nullable: true})
    tertiarySchool?: string;
    @Column({type: "enum", enum: TertiaryLevel, nullable: true})
    tertiaryLevel?: string;
    @Column({
        type: "enum",
        enum: GradeEnum,
        nullable: true,
    })
    kcseGrade?: GradeEnum;

    // ✅ Deleting AcademicHistory will set student reference to null (SET NULL)
    @OneToOne(() => Student, (student) => student.academicHistory, {
        onDelete: "CASCADE",
        nullable: false,
        orphanedRowAction: 'delete'
    })
    @JoinColumn({name: "student_id"})
    student?: Student | null;

    constructor(data?: AcademicHistoryObj) {
        if (data) {
            this.highSchool = data.highSchool;
            this.primarySchool = data.primarySchool;
            this.kcseIndexNumber = data.kcseIndexNumber;
            this.kcseGrade = data.kcseGrade;
            this.highestEducationLevel = data.basicEducationLevel;
        }
    }
}
