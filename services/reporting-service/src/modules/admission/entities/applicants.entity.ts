import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    BasicEducationEnum,
    ExamBody,
    GenderEnum,
    GradeEnum,
    IdTypeEnum,
    StudentTypeEnum,
    TertiaryLevel,
} from '../../../libs/@types/global.types';

@Entity('applicant_records')
export class ApplicantRecords {
    [key: string]:
        | string
        | number
        | boolean
        | null
        | Date
        | IdTypeEnum
        | GenderEnum
        | BasicEducationEnum
        | TertiaryLevel
        | GradeEnum
        | ExamBody
        | StudentTypeEnum;
    @PrimaryColumn('uuid')
    id: string;

    // --- Base Applicant Info ---
    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    middleName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    @Index()
    email: string;

    @Column({ nullable: true })
    phone: string;

    // @Column({ type: 'enum', enum: IdTypeEnum, nullable: true })
    // idType: IdTypeEnum;
    @Column({ type: 'varchar', length: 50, nullable: true })
    birthCertNumber: string;

    @Column({ nullable: true })
    idNumber: string;

    @Column({ type: 'enum', enum: GenderEnum, nullable: true })
    gender: GenderEnum;

    // @Column({ type: 'timestamptz', nullable: true })
    // birthDay: Date;

    @Column({ length: 100, nullable: true })
    pinNumber: string;

    // ---  Data ---
    @Column({ type: 'int', nullable: true })
    zipCode: number;

    @Column({ type: 'int', nullable: true })
    poBox: number;

    @Column({ nullable: true })
    county: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    subLocation: string;

    @Column({ nullable: true })
    village: string;

    // --- Academic History ---
    @Column({ type: 'enum', enum: BasicEducationEnum, nullable: true })
    highestEducationLevel: BasicEducationEnum;

    @Column({ nullable: true })
    kcseIndexNumber: string;

    @Column({ nullable: true })
    kcpeIndexNumber: string;

    @Column({ nullable: true })
    primarySchool: string;

    @Column({ nullable: true })
    highSchool: string;

    @Column({ type: 'enum', enum: TertiaryLevel, nullable: true })
    tertiaryLevel: TertiaryLevel;

    @Column({ nullable: true })
    tertiarySchool: string;

    @Column({ type: 'enum', enum: GradeEnum, nullable: true })
    kcseGrade: GradeEnum;

    // --- Enrollment Data ---
    @Column({ type: 'int', nullable: true })
    course: number;

    @Column({ type: 'boolean', default: true, nullable: true })
    newApplicant!: boolean;

    @Column({ type: 'varchar', nullable: true })
    intake: string;

    @Column({ type: 'date', default: null, nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    admissionNumber: string;

    @Column({ type: 'int', nullable: true })
    yearOfStudy: number;

    @Column({
        type: 'enum',
        enum: ExamBody,
        default: ExamBody.CDACC,
        nullable: true,
    })
    examiningBody: ExamBody;

    @Column({ type: 'enum', enum: StudentTypeEnum, nullable: true })
    studentType: StudentTypeEnum;

    // --- Next of Kin 1 ---
    @Column({ nullable: true })
    nok1FirstName: string;

    @Column({ nullable: true })
    nok1LastName: string;

    @Column({ nullable: true })
    nok1Phone: string;

    @Column({ nullable: true })
    nok1Email: string;

    @Column({ nullable: true })
    nok1Relationship: string;

    // --- Next of Kin 2 ---
    @Column({ nullable: true })
    nok2FirstName: string;

    @Column({ nullable: true })
    nok2LastName: string;

    @Column({ nullable: true })
    nok2Phone: string;

    @Column({ nullable: true })
    nok2Email: string;

    @Column({ nullable: true })
    nok2Relationship: string;

    // --- Metadata ---
    @Column({ default: false })
    submitted: boolean;

    @Column({ type: 'int', default: 0 })
    completionStatus: number;

    @Column({ default: false })
    migrated: boolean;
    @Column({ default: false })
    pending: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
