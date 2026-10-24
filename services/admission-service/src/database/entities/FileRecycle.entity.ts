import {Entity, PrimaryKey, Property} from "@mikro-orm/core";
import {BaseEntity, Opt} from "@mikro-orm/postgresql";

@Entity()
export class FileRecycle extends BaseEntity {
    @PrimaryKey({type: 'int', autoincrement: true})
    id!: number;
    @Property({type: 'string', unique: true})
    fileName!: string;
    @Property({hidden: true})
    createdAt: Date & Opt = new Date();
    @Property({onUpdate: () => new Date(), hidden: true})
    updatedAt: Date & Opt = new Date();
}

