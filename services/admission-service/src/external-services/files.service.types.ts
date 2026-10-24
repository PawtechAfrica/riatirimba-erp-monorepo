export interface FileRecordRespObj {
    id: number;
    originalName: string;
    fieldName: string;
    storagePath: string;
    mimeType: string;
    size: number; // in bytes
    status: "pending" | "uploaded" | "failed"; // extend as needed
    updatedAt: string; // ISO timestamp
    createdAt: string; // ISO timestamp
}

export interface IndexedFileRespObj {
    field: string;
    file: FileRecordRespObj;
    b2FileName: string;
}

export interface UploadedFilesRespObj {
    message: string;
    files: IndexedFileRespObj[];
}
