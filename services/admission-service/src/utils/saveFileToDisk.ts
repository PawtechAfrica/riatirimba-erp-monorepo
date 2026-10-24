import {promises as fs} from 'fs';
import {join, resolve} from 'path';
import {v4 as uuidv4} from 'uuid';
import sanitizeFilename from 'sanitize-filename';

// Configuration
const UPLOAD_DIR: string = resolve(process.cwd(), 'uploads/files');
const BASE_URL: string = process.env.BASE_URL || 'http://localhost:5000';
const MAX_FILE_SIZE: number = 5_000_000; // 5MB in bytes

// Supported file types
interface FileTypeConfig {
    mime: string;
    extension: string;
    magic: string | Buffer;
}

// Map of supported file types
const FILE_TYPES: Record<string, FileTypeConfig> = {
    pdf: {mime: 'application/pdf', extension: 'pdf', magic: '%PDF'},
    png: {mime: 'image/png', extension: 'png', magic: Buffer.from([0x89, 0x50, 0x4e, 0x47])}, // PNG signature
    jpeg: {mime: 'image/jpeg', extension: 'jpg', magic: Buffer.from([0xff, 0xd8, 0xff])}, // JPEG signature
};

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
    try {
        await fs.mkdir(UPLOAD_DIR, {recursive: true});
    } catch (error: any) {
        throw new Error(`Failed to create upload directory: ${error.message}`);
    }
}

/**
 * Converts a Base64 string to a file (PDF or image), detects the file type, stores it securely, and returns a URL.
 * @param base64String - The Base64-encoded file data (with or without data URI prefix).
 * @param fileName - Optional filename (without extension).
 * @returns A promise resolving to the URL of the stored file.
 * @throws Error if the Base64 string is invalid, file type is unsupported, file size exceeds 5MB, or file operations fail.
 */
export async function convertBase64ToFile(base64String: string, fileName?: string): Promise<string> {
    try {
        // Validate Base64 string
        if (!base64String || typeof base64String !== 'string') {
            throw new Error('Invalid or missing Base64 string');
        }

        // Validate Base64 format
        if (!/^[A-Za-z0-9+/=]+$/.test(base64String.replace(/^data:[^;]+;base64,/, ''))) {
            throw new Error('Invalid Base64 string format');
        }

        // Detect MIME type from data URI if present
        let base64Data: string = base64String;
        let detectedMime: string | undefined;
        if (base64String.startsWith('data:')) {
            const match = base64String.match(/^data:([^;]+);base64,/);
            if (match) {
                detectedMime = match[1];
                base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
            }
        }

        // Decode Base64 to buffer
        let buffer: Buffer;
        try {
            buffer = Buffer.from(base64Data, 'base64');
        } catch (error: any) {
            throw new Error('Failed to decode Base64 string: Invalid encoding');
        }

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds 5MB limit (size: ${(buffer.length / 1_000_000).toFixed(2)}MB)`);
        }

        // Detect file type from MIME type or magic numbers
        let fileType: string | undefined;
        if (detectedMime) {
            fileType = Object.keys(FILE_TYPES).find((key) => FILE_TYPES[key].mime === detectedMime);
            if (!fileType) {
                throw new Error('Unsupported file type in data URI. Supported types: PDF, PNG, JPEG');
            }
        } else {
            // No MIME type; detect using magic numbers
            for (const [type, {magic}] of Object.entries(FILE_TYPES)) {
                const isMatch =
                    typeof magic === 'string'
                        ? buffer.toString('utf8', 0, magic.length) === magic
                        : buffer.slice(0, magic.length).equals(magic);
                if (isMatch) {
                    fileType = type;
                    break;
                }
            }
            if (!fileType) {
                throw new Error('Unable to detect file type. Supported types: PDF, PNG, JPEG');
            }
        }

        // Get file type details
        const {extension}: FileTypeConfig = FILE_TYPES[fileType];

        // Generate a safe filename
        const sanitizedFileName: string = fileName ? sanitizeFilename(fileName) : uuidv4();
        const filePath: string = join(UPLOAD_DIR, `${sanitizedFileName}.${extension}`);

        // Ensure upload directory exists
        await ensureUploadDir();

        // Prevent file overwrite
        try {
            await fs.access(filePath);
            throw new Error('File already exists, please provide a unique filename');
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw new Error(`File access error: ${error.message}`);
            }
        }

        // Write file to disk
        await fs.writeFile(filePath, buffer);

        // Generate and return URL
        return `${BASE_URL}/files/${sanitizedFileName}.${extension}`;
    } catch (error: any) {
        throw new Error(`Failed to convert Base64 to file: ${error.message}`);
    }
}
