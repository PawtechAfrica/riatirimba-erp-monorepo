import {
    AfterRemove,
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {Student} from "./Students.entity";

@Entity()
export class StudentDocument extends BaseEntity {
    @PrimaryGeneratedColumn("increment", {type: "bigint"})
    id!: number;
    @Column()
    documentKey!: string;
    @Column({unique: true})
    url!: string;
    @UpdateDateColumn({name: "updated_at"})
    updatedAt!: Date;

    // ✅ Deleting StudentDocument will set the owner reference to null (SET NULL)
    @ManyToOne(() => Student, (student) => student.documents, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
    })
    @JoinColumn({name: "owner_id"})
    owner?: Student | null;

    @AfterRemove()
    deleteFromFileSystem() {
        // implement file deletion handlers here
        // e.g., remove from S3 or local storage
    }
}
