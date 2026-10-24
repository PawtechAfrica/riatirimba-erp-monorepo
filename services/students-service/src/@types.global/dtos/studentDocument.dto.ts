
import { IsNotEmpty, IsUrl, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentDocumentDto {
    @IsNotEmpty({ message: 'Document key is required' })
    documentKey!: string;

    @IsNotEmpty({ message: 'URL is required' })
    @IsUrl({}, { message: 'Invalid URL format' })
    url!: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid owner ID format' })
    ownerId?: string;
}

export class StudentDocumentResponseDto {
    id!: number;
    documentKey!: string;
    url!: string;
    updatedAt!: Date;
    ownerId!: string;

    constructor(document: any) {
        this.id = document.id;
        this.documentKey = document.documentKey;
        this.url = document.url;
        this.updatedAt = document.updatedAt;
        this.ownerId = document.owner?.id || document.ownerId;
    }
}
export class UpdateStudentDocumentDto {
    @IsOptional()
    documentKey?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid URL format' })
    url?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid owner ID format' })
    ownerId?: string;
}